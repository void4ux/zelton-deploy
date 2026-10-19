import { Project, Track, Clip, TransportState, AudioClipData, InstrumentPresetType } from '../types/daw';
import { DrumSynth, InstrumentEngine, midiNoteToFrequency, DEFAULT_SYNTH_PARAMS } from './synthEngine';
import { buildEffectNode, BuiltEffect } from './effectsChain';
import { audioBufferToWav, extractWaveformPeaks } from './wavEncoder';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Track routing
  private trackNodes: Map<string, {
    gain: GainNode;
    panner: StereoPannerNode;
    fxNodes: BuiltEffect[];
  }> = new Map();

  // Active playing sources to clean up on pause/stop
  private activeSources: Set<AudioBufferSourceNode | OscillatorNode> = new Set();

  // Transport & Scheduling
  private isPlaying = false;
  private isRecording = false;
  private currentBeat = 0;
  private lastScheduleTime = 0;
  private scheduleTimer: number | null = null;
  private lookaheadMs = 25;
  private scheduleAheadSec = 0.1;
  private lastMetronomeBeat = -1;

  // Recording
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartBeat = 0;
  private recordingTrackId: string | null = null;

  // Listeners
  private onBeatUpdate?: (beat: number) => void;
  private onStop?: () => void;

  constructor() {}

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setBeatCallback(cb: (beat: number) => void) {
    this.onBeatUpdate = cb;
  }

  public setStopCallback(cb: () => void) {
    this.onStop = cb;
  }

  public syncTracks(project: Project) {
    const ctx = this.getContext();
    const activeTrackIds = new Set(project.tracks.map(t => t.id));

    // Remove deleted tracks
    for (const [id, nodes] of this.trackNodes.entries()) {
      if (!activeTrackIds.has(id)) {
        nodes.gain.disconnect();
        nodes.panner.disconnect();
        this.trackNodes.delete(id);
      }
    }

    const hasSolo = project.tracks.some(t => t.soloed);

    // Setup or update existing tracks
    for (const track of project.tracks) {
      let nodeRecord = this.trackNodes.get(track.id);
      if (!nodeRecord) {
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();

        const fxNodes: BuiltEffect[] = [];
        let lastNode: AudioNode = gain;

        for (const fx of track.effects) {
          const built = buildEffectNode(ctx, fx);
          lastNode.connect(built.input);
          lastNode = built.output;
          fxNodes.push(built);
        }

        lastNode.connect(panner);
        panner.connect(this.masterGain!);

        nodeRecord = { gain, panner, fxNodes };
        this.trackNodes.set(track.id, nodeRecord);
      }

      // Volume & Mute/Solo calculations
      let targetGain = track.volume;
      if (track.muted || (hasSolo && !track.soloed)) {
        targetGain = 0;
      }
      nodeRecord.gain.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.02);
      nodeRecord.panner.pan.setTargetAtTime(track.pan, ctx.currentTime, 0.02);
    }
  }

  public play(project: Project, startBeat: number = 0) {
    const ctx = this.getContext();
    this.stopAllActiveSources();

    this.isPlaying = true;
    this.currentBeat = startBeat;
    this.lastScheduleTime = ctx.currentTime;
    this.lastMetronomeBeat = Math.floor(startBeat) - 1;

    this.syncTracks(project);
    this.startSchedulerLoop(project);
  }

  public pause() {
    this.isPlaying = false;
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }
    this.stopAllActiveSources();
  }

  public stop() {
    this.pause();
    this.currentBeat = 0;
    this.lastMetronomeBeat = -1;
    if (this.onBeatUpdate) {
      this.onBeatUpdate(0);
    }
    if (this.onStop) {
      this.onStop();
    }
  }

  public seek(beat: number) {
    this.currentBeat = Math.max(0, beat);
    this.lastMetronomeBeat = Math.floor(this.currentBeat) - 1;
    if (this.onBeatUpdate) {
      this.onBeatUpdate(this.currentBeat);
    }
  }

  private stopAllActiveSources() {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // already stopped
      }
    }
    this.activeSources.clear();
  }

  private startSchedulerLoop(project: Project) {
    if (this.scheduleTimer) clearInterval(this.scheduleTimer);

    let previousCtxTime = this.getContext().currentTime;

    this.scheduleTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      const ctx = this.getContext();
      const currentCtxTime = ctx.currentTime;
      const deltaSec = currentCtxTime - previousCtxTime;
      previousCtxTime = currentCtxTime;

      // Update current beat
      const beatsPerSec = project.bpm / 60;
      this.currentBeat += deltaSec * beatsPerSec;

      // Loop check
      if (project.loopEnabled && this.currentBeat >= project.loopEndBeat) {
        this.currentBeat = project.loopStartBeat + (this.currentBeat - project.loopEndBeat);
        this.lastMetronomeBeat = Math.floor(this.currentBeat) - 1;
      }

      if (this.onBeatUpdate) {
        this.onBeatUpdate(this.currentBeat);
      }

      // Schedule events in lookahead window
      this.scheduleEvents(project, this.currentBeat, this.scheduleAheadSec * beatsPerSec);
    }, this.lookaheadMs);
  }

  private scheduleEvents(project: Project, startBeat: number, durationBeats: number) {
    const ctx = this.getContext();
    const endBeat = startBeat + durationBeats;
    const secPerBeat = 60 / project.bpm;

    for (const clip of project.clips) {
      const trackNode = this.trackNodes.get(clip.trackId);
      if (!trackNode) continue;

      const clipStart = clip.startBeat;
      const clipEnd = clip.startBeat + clip.durationBeats;

      if (clipEnd <= startBeat || clipStart >= endBeat) continue;

      if (clip.type === 'instrument' && clip.notes) {
        for (const note of clip.notes) {
          const noteStartBeat = clip.startBeat + note.startBeat;
          if (noteStartBeat >= startBeat && noteStartBeat < endBeat) {
            const timeOffsetSec = (noteStartBeat - startBeat) * secPerBeat;
            const startTime = ctx.currentTime + Math.max(0, timeOffsetSec);
            const durationSec = Math.max(0.05, note.durationBeats * secPerBeat);
            const trackObj = project.tracks.find(t => t.id === clip.trackId);
            const preset = (clip as any).instrumentPreset || trackObj?.instrumentPreset || 'grand_piano';

            InstrumentEngine.playInstrumentNote(
              ctx,
              trackNode.gain,
              note.pitch,
              startTime,
              durationSec,
              note.velocity,
              preset
            );
          }
        }
      } else if (clip.type === 'drum' && clip.drumSteps) {
        for (const step of clip.drumSteps) {
          if (!step.active) continue;
          const stepBeat = clip.startBeat + (step.step * 0.25);
          if (stepBeat >= startBeat && stepBeat < endBeat) {
            const timeOffsetSec = (stepBeat - startBeat) * secPerBeat;
            const startTime = ctx.currentTime + Math.max(0, timeOffsetSec);

            DrumSynth.playDrum(ctx, trackNode.gain, step.pitch, startTime, step.velocity);
          }
        }
      } else if (clip.type === 'audio' && clip.audio?.buffer) {
        if (clipStart >= startBeat && clipStart < endBeat) {
          const timeOffsetSec = (clipStart - startBeat) * secPerBeat;
          const startTime = ctx.currentTime + Math.max(0, timeOffsetSec);

          const source = ctx.createBufferSource();
          source.buffer = clip.audio.buffer;
          source.connect(trackNode.gain);
          source.start(startTime, clip.offsetBeat * secPerBeat);
          this.activeSources.add(source);
          source.onended = () => this.activeSources.delete(source);
        }
      }
    }
  }

  public playMetronomeTick(isDownbeat: boolean) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, ctx.currentTime);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  private triggerSynthNote(
    ctx: BaseAudioContext,
    dest: AudioNode,
    pitch: number,
    startTime: number,
    duration: number,
    velocity: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const freq = midiNoteToFrequency(pitch);
    osc.type = DEFAULT_SYNTH_PARAMS.waveform;
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(DEFAULT_SYNTH_PARAMS.filterCutoff, startTime);
    filter.Q.setValueAtTime(DEFAULT_SYNTH_PARAMS.filterResonance, startTime);

    const a = DEFAULT_SYNTH_PARAMS.attack;
    const d = DEFAULT_SYNTH_PARAMS.decay;
    const s = DEFAULT_SYNTH_PARAMS.sustain;
    const r = DEFAULT_SYNTH_PARAMS.release;
    const peakGain = Math.min(1.0, velocity * 0.8);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + a);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain * s), startTime + a + d);
    gain.gain.setValueAtTime(Math.max(0.0001, peakGain * s), startTime + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + r);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + duration + r + 0.05);

    if (ctx instanceof AudioContext) {
      this.activeSources.add(osc);
      osc.onended = () => this.activeSources.delete(osc);
    }
  }

  public previewNote(pitch: number, velocity: number = 100, preset: InstrumentPresetType = 'grand_piano') {
    const ctx = this.getContext();
    InstrumentEngine.playInstrumentNote(ctx, this.masterGain!, pitch, ctx.currentTime, 0.45, velocity, preset);
  }

  public previewDrum(pitch: number, velocity: number = 100) {
    const ctx = this.getContext();
    DrumSynth.playDrum(ctx, this.masterGain!, pitch, ctx.currentTime, velocity);
  }

  public async startRecording(trackId: string, currentBeat: number): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      });

      this.recordingTrackId = trackId;
      this.recordingStartBeat = currentBeat;
      this.recordedChunks = [];

      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      return false;
    }
  }

  public async stopRecording(bpm: number): Promise<Clip | null> {
    if (!this.mediaRecorder || !this.isRecording || !this.recordingTrackId) {
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const ctx = this.getContext();

        let audioBuffer: AudioBuffer | null = null;
        try {
          audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        } catch {
          audioBuffer = ctx.createBuffer(2, ctx.sampleRate * 1, ctx.sampleRate);
        }

        const durationSeconds = audioBuffer.duration;
        const durationBeats = (durationSeconds / 60) * bpm;
        const peaks = extractWaveformPeaks(audioBuffer, 150);

        const newClip: Clip = {
          id: `rec-${Date.now()}`,
          trackId: this.recordingTrackId!,
          name: `Take ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          startBeat: Math.round(this.recordingStartBeat * 4) / 4,
          durationBeats: Math.max(1, Math.round(durationBeats * 4) / 4),
          offsetBeat: 0,
          type: 'audio',
          color: '#d93829',
          gain: 1.0,
          pan: 0,
          audio: {
            buffer: audioBuffer,
            durationSeconds,
            sampleRate: audioBuffer.sampleRate,
            channels: audioBuffer.numberOfChannels,
            waveformPeaks: peaks
          }
        };

        this.mediaStream?.getTracks().forEach(t => t.stop());
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.isRecording = false;

        resolve(newClip);
      };

      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  public getMasterPeak(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let max = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > max) max = data[i];
    }
    return max / 255;
  }

  // Full arrangement Offline Rendering to 16-bit WAV
  public async renderProjectToWav(
    project: Project,
    soloTrackId?: string
  ): Promise<Blob> {
    let maxEndBeat = 16;
    for (const clip of project.clips) {
      const end = clip.startBeat + clip.durationBeats;
      if (end > maxEndBeat) maxEndBeat = end;
    }
    const totalSeconds = (maxEndBeat / project.bpm) * 60 + 2.0;
    const sampleRate = 44100;
    const totalFrames = Math.ceil(totalSeconds * sampleRate);

    const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);
    const offlineMaster = offlineCtx.createGain();
    offlineMaster.connect(offlineCtx.destination);

    const offlineTrackGains = new Map<string, GainNode>();
    for (const track of project.tracks) {
      if (track.muted || (soloTrackId && track.id !== soloTrackId)) continue;
      const tGain = offlineCtx.createGain();
      tGain.gain.value = track.volume;

      const panner = offlineCtx.createStereoPanner();
      panner.pan.value = track.pan;

      let lastNode: AudioNode = tGain;
      for (const fx of track.effects) {
        if (!fx.enabled) continue;
        const built = buildEffectNode(offlineCtx, fx);
        lastNode.connect(built.input);
        lastNode = built.output;
      }
      lastNode.connect(panner);
      panner.connect(offlineMaster);
      offlineTrackGains.set(track.id, tGain);
    }

    const secPerBeat = 60 / project.bpm;

    for (const clip of project.clips) {
      const tGain = offlineTrackGains.get(clip.trackId);
      if (!tGain) continue;

      if (clip.type === 'instrument' && clip.notes) {
        for (const note of clip.notes) {
          const noteStartSec = (clip.startBeat + note.startBeat) * secPerBeat;
          const noteDurSec = note.durationBeats * secPerBeat;
          const trackObj = project.tracks.find(t => t.id === clip.trackId);
          const preset = (clip as any).instrumentPreset || trackObj?.instrumentPreset || 'grand_piano';
          InstrumentEngine.playInstrumentNote(
            offlineCtx,
            tGain,
            note.pitch,
            noteStartSec,
            noteDurSec,
            note.velocity,
            preset
          );
        }
      } else if (clip.type === 'drum' && clip.drumSteps) {
        for (const step of clip.drumSteps) {
          if (!step.active) continue;
          const stepSec = (clip.startBeat + step.step * 0.25) * secPerBeat;
          DrumSynth.playDrum(offlineCtx, tGain, step.pitch, stepSec, step.velocity);
        }
      } else if (clip.type === 'audio' && clip.audio?.buffer) {
        const startSec = clip.startBeat * secPerBeat;
        const src = offlineCtx.createBufferSource();
        src.buffer = clip.audio.buffer;
        src.connect(tGain);
        src.start(startSec, clip.offsetBeat * secPerBeat);
      }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWav(renderedBuffer);
  }

  // Export each track as separate stems
  public async renderStems(project: Project): Promise<{ name: string; blob: Blob }[]> {
    const results: { name: string; blob: Blob }[] = [];
    for (const track of project.tracks) {
      const stemBlob = await this.renderProjectToWav(project, track.id);
      results.push({
        name: `${track.name.toLowerCase().replace(/\s+/g, '_')}_stem.wav`,
        blob: stemBlob
      });
    }
    return results;
  }
}

export const audioEngine = new AudioEngine();

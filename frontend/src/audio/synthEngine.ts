import { InstrumentPresetType } from '../types/daw';

export interface SynthParams {
  waveform: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterCutoff: number;
  filterResonance: number;
}

export const DEFAULT_SYNTH_PARAMS: SynthParams = {
  waveform: 'sawtooth',
  attack: 0.01,
  decay: 0.2,
  sustain: 0.5,
  release: 0.3,
  filterCutoff: 3000,
  filterResonance: 2,
};

export function midiNoteToFrequency(note: number): number {
  return 440 * Math.pow(2, (note - 69) / 12);
}

/**
 * High-fidelity Instrument Synthesizer engine.
 * Synthesizes rich acoustic piano, vintage Rhodes, punchy 808 sub, and analog synth leads.
 */
export class InstrumentEngine {
  static playInstrumentNote(
    ctx: BaseAudioContext,
    destination: AudioNode,
    pitch: number,
    startTime: number,
    duration: number,
    velocity: number = 100,
    preset: InstrumentPresetType = 'rhodes_keys'
  ) {
    const freq = midiNoteToFrequency(pitch);
    const gainNorm = (velocity / 127) * 0.85;

    switch (preset) {
      case 'grand_piano':
        this.playGrandPiano(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      case 'rhodes_keys':
        this.playRhodesKeys(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      case 'vintage_organ':
        this.playVintageOrgan(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      case 'sub_808':
        this.play808SubBass(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      case 'synth_lead':
        this.playAnalogLead(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      case 'pluck':
        this.playAcousticPluck(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      case 'synth_pad':
        this.playSynthPad(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      case 'synth_brass':
        this.playSynthBrass(ctx, destination, freq, startTime, duration, gainNorm);
        break;
      default:
        this.playGrandPiano(ctx, destination, freq, startTime, duration, gainNorm);
        break;
    }
  }

  // Concert Acoustic Grand Piano: 4 harmonic layers with hammer strike transient
  private static playGrandPiano(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const osc1 = ctx.createOscillator(); // Fundamental
    const osc2 = ctx.createOscillator(); // 2nd harmonic
    const osc3 = ctx.createOscillator(); // 3rd harmonic
    const osc4 = ctx.createOscillator(); // 4th harmonic sparkle
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();
    const gain4 = ctx.createGain();
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3, time);

    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(freq * 4, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(14000, freq * 7), time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(1200, freq * 1.8), time + 0.6);

    masterGain.gain.setValueAtTime(0.0001, time);
    // Instant hammer contact
    masterGain.gain.linearRampToValueAtTime(gain, time + 0.003);
    masterGain.gain.exponentialRampToValueAtTime(gain * 0.42, time + 0.3);
    masterGain.gain.exponentialRampToValueAtTime(gain * 0.18, time + Math.max(0.6, duration));
    masterGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.45);

    gain1.gain.value = 0.75;
    gain2.gain.value = 0.3;
    gain3.gain.value = 0.12;
    gain4.gain.value = 0.05;

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    osc4.connect(gain4);

    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);
    gain4.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    osc3.start(time);
    osc4.start(time);

    const stopTime = time + duration + 0.5;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
    osc4.stop(stopTime);
  }

  // Classic Rhodes Electric Piano: Sine + tine metallic strike + soft tremolo
  private static playRhodesKeys(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const oscBody = ctx.createOscillator();
    const oscTine = ctx.createOscillator();
    const gainBody = ctx.createGain();
    const gainTine = ctx.createGain();
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscBody.type = 'sine';
    oscBody.frequency.setValueAtTime(freq, time);

    // High metal tine harmonic ping
    oscTine.type = 'triangle';
    oscTine.frequency.setValueAtTime(freq * 7, time);

    gainTine.gain.setValueAtTime(gain * 0.35, time);
    gainTine.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(8000, freq * 5), time);

    masterGain.gain.setValueAtTime(0.0001, time);
    masterGain.gain.linearRampToValueAtTime(gain * 0.9, time + 0.006);
    masterGain.gain.exponentialRampToValueAtTime(gain * 0.35, time + 0.4);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.35);

    oscBody.connect(gainBody);
    oscTine.connect(gainTine);

    gainBody.connect(filter);
    gainTine.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(dest);

    oscBody.start(time);
    oscTine.start(time);

    const stopTime = time + duration + 0.4;
    oscBody.stop(stopTime);
    oscTine.stop(stopTime);
  }

  // Vintage Drawbar Organ: 4 additive drawbars with key click
  private static playVintageOrgan(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const oscs = [
      { type: 'sine' as OscillatorType, mult: 1, g: 0.8 },   // 8'
      { type: 'sine' as OscillatorType, mult: 2, g: 0.6 },   // 4'
      { type: 'sine' as OscillatorType, mult: 3, g: 0.4 },   // 2 2/3'
      { type: 'sine' as OscillatorType, mult: 4, g: 0.3 },   // 2'
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, time);
    masterGain.gain.linearRampToValueAtTime(gain * 0.7, time + 0.003);
    masterGain.gain.setValueAtTime(gain * 0.7, time + duration);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.08);

    masterGain.connect(dest);

    oscs.forEach(({ type, mult, g }) => {
      const osc = ctx.createOscillator();
      const gNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq * mult, time);
      gNode.gain.value = g;
      osc.connect(gNode);
      gNode.connect(masterGain);
      osc.start(time);
      osc.stop(time + duration + 0.1);
    });
  }

  // Synth Pad: Slow lush attack, detuned saws with resonant filter swell
  private static playSynthPad(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq * 0.998, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.002, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(3200, time + 0.8);
    filter.Q.value = 2.0;

    masterGain.gain.setValueAtTime(0.0001, time);
    masterGain.gain.linearRampToValueAtTime(gain * 0.6, time + 0.35); // Slow lush pad attack
    masterGain.gain.setValueAtTime(gain * 0.5, time + duration);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.8); // Long release

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    const stopTime = time + duration + 0.9;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
  }

  // Retro 80s Synth Brass: Dual bright saw waves with snappy brass filter envelope
  private static playSynthBrass(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.006, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, time);
    filter.frequency.exponentialRampToValueAtTime(5000, time + 0.05); // Snappy brass bite
    filter.frequency.exponentialRampToValueAtTime(2200, time + 0.25);
    filter.Q.value = 3.5;

    masterGain.gain.setValueAtTime(0.0001, time);
    masterGain.gain.linearRampToValueAtTime(gain * 0.8, time + 0.02);
    masterGain.gain.setValueAtTime(gain * 0.6, time + duration);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(dest);

    osc1.start(time);
    osc2.start(time);
    const stopTime = time + duration + 0.25;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
  }

  // Deep 808 Sub Bass: Pitch-dropping transient into warm resonant sub-sine
  private static play808SubBass(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    // Pitch transient pop
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(gain * 1.2, time + 0.005);
    gainNode.gain.setValueAtTime(gain, time + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.25);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    osc.start(time);
    osc.stop(time + duration + 0.3);
  }

  // Analog Synth Lead: Dual detuned sawtooth with envelope filter sweep
  private static playAnalogLead(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.004, time); // detune +7 cents

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, time);
    filter.Q.setValueAtTime(4.0, time);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(gain * 0.8, time + 0.02);
    gainNode.gain.setValueAtTime(gain * 0.6, time + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    osc1.start(time);
    osc2.start(time);
    const stopTime = time + duration + 0.25;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
  }

  // Snappy Pluck: Quick decay with resonant bandpass
  private static playAcousticPluck(
    ctx: BaseAudioContext,
    dest: AudioNode,
    freq: number,
    time: number,
    duration: number,
    gain: number
  ) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 8, time);
    filter.frequency.exponentialRampToValueAtTime(freq, time + 0.15);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(gain * 1.1, time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + Math.min(0.4, duration));

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    osc.start(time);
    osc.stop(time + 0.45);
  }
}

/**
 * Procedural Drum Generator using pure Web Audio DSP.
 */
export class DrumSynth {
  static playDrum(
    ctx: BaseAudioContext,
    destination: AudioNode,
    pitch: number,
    time: number,
    velocity: number = 100
  ): void {
    const gainScale = velocity / 127;

    switch (pitch) {
      case 36:
        this.playKick(ctx, destination, time, gainScale);
        break;
      case 38:
        this.playSnare(ctx, destination, time, gainScale);
        break;
      case 39:
        this.playClap(ctx, destination, time, gainScale);
        break;
      case 42:
        this.playHiHat(ctx, destination, time, gainScale, 0.05);
        break;
      case 46:
        this.playHiHat(ctx, destination, time, gainScale, 0.35);
        break;
      case 45:
        this.playTom(ctx, destination, time, gainScale);
        break;
      default:
        this.playHiHat(ctx, destination, time, gainScale, 0.08);
        break;
    }
  }

  private static playKick(ctx: BaseAudioContext, dest: AudioNode, time: number, gain: number): void {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

    gainNode.gain.setValueAtTime(gain * 1.2, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gainNode);
    gainNode.connect(dest);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  private static playSnare(ctx: BaseAudioContext, dest: AudioNode, time: number, gain: number): void {
    const bufferSize = ctx.sampleRate * 0.2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(gain * 0.8, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);

    oscGain.gain.setValueAtTime(gain * 0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

    osc.connect(oscGain);
    oscGain.connect(dest);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.2);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private static playClap(ctx: BaseAudioContext, dest: AudioNode, time: number, gain: number): void {
    const bufferSize = ctx.sampleRate * 0.25;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.5, time);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.setValueAtTime(gain * 0.7, time);
    gainNode.gain.exponentialRampToValueAtTime(0.05, time + 0.015);
    gainNode.gain.setValueAtTime(gain * 0.8, time + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.05, time + 0.035);
    gainNode.gain.setValueAtTime(gain * 0.9, time + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    noise.start(time);
    noise.stop(time + 0.25);
  }

  private static playHiHat(
    ctx: BaseAudioContext,
    dest: AudioNode,
    time: number,
    gain: number,
    decay: number
  ): void {
    const bufferSize = ctx.sampleRate * decay;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, time);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain * 0.5, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    noise.start(time);
    noise.stop(time + decay);
  }

  private static playTom(ctx: BaseAudioContext, dest: AudioNode, time: number, gain: number): void {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(75, time + 0.2);

    gainNode.gain.setValueAtTime(gain, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gainNode);
    gainNode.connect(dest);

    osc.start(time);
    osc.stop(time + 0.25);
  }
}

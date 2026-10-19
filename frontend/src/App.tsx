import React, { useState, useEffect, useRef } from 'react';
import { Project, Track, Clip, TransportState, MidiNote, DrumStep, EffectConfig, TrackType, ToolMode, InstrumentPresetType } from './types/daw';
import { createDefaultProject } from './data/defaultProject';
import { audioEngine } from './audio/AudioEngine';
import { ProjectStore } from './storage/projectStore';
import { getVocalPreset } from './audio/vocalPresets';
import { extractWaveformPeaks } from './audio/wavEncoder';
import { TopNav } from './components/TopNav';
import { TrackList } from './components/TrackList';
import { ArrangementTimeline } from './components/ArrangementTimeline';
import { BottomPanel } from './components/BottomPanel';
import { SidebarLibrary } from './components/SidebarLibrary';
import { AddTrackModal } from './components/AddTrackModal';
import { AutoPitchModal } from './components/AutoPitchModal';
import { LyricsPad } from './components/LyricsPad';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { exportTrackToMidiBlob } from './audio/midiFileEncoder';

export const App: React.FC = () => {
  const [project, setProject] = useState<Project>(() => {
    return ProjectStore.loadFromStorage() || createDefaultProject();
  });

  const [transport, setTransport] = useState<TransportState>({
    isPlaying: false,
    isRecording: false,
    currentBeat: 0,
    currentTimeSeconds: 0,
    bpm: project.bpm,
    metronome: false,
    metronomeSound: 'click',
    countIn: 0,
    loop: project.loopEnabled,
    loopStartBeat: project.loopStartBeat,
    loopEndBeat: project.loopEndBeat,
    displayMode: 'bars',
    activeTool: 'select',
    showAutomation: false,
    showLyrics: false,
    showAutoPitchModal: false
  });

  const [selectedTrackId, setSelectedTrackId] = useState<string>(() => project.tracks[0]?.id || '');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(() => project.clips[0]?.id || null);
  const [masterPeak, setMasterPeak] = useState(0);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [showAutoPitchModal, setShowAutoPitchModal] = useState(false);
  const [showAiAssistantModal, setShowAiAssistantModal] = useState(false);
  const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync AudioEngine
  useEffect(() => {
    audioEngine.syncTracks(project);
    ProjectStore.saveToStorage(project);
  }, [project]);

  // Beat callback & metronome
  useEffect(() => {
    let lastBeatFloored = -1;
    audioEngine.setBeatCallback(beat => {
      setTransport(t => {
        if (t.metronome) {
          const currentFloor = Math.floor(beat);
          if (currentFloor !== lastBeatFloored) {
            lastBeatFloored = currentFloor;
            audioEngine.playMetronomeTick(currentFloor % 4 === 0);
          }
        }
        return {
          ...t,
          currentBeat: beat,
          currentTimeSeconds: (beat / project.bpm) * 60
        };
      });
    });

    audioEngine.setStopCallback(() => {
      setTransport(t => ({ ...t, isPlaying: false, currentBeat: 0 }));
    });
  }, [project.bpm]);

  // Meter peak poll
  useEffect(() => {
    let raf: number;
    const tick = () => {
      setMasterPeak(audioEngine.getMasterPeak());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        transport.isPlaying ? handlePause() : handlePlay();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? handleRedo() : handleUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [transport.isPlaying, project]);

  const updateWithHistory = (updater: (prev: Project) => Project) => {
    setProject(prev => {
      ProjectStore.pushHistory(prev);
      return updater(prev);
    });
  };

  // Transport
  const handlePlay = () => {
    audioEngine.play(project, transport.currentBeat);
    setTransport(t => ({ ...t, isPlaying: true }));
  };

  const handlePause = () => {
    audioEngine.pause();
    setTransport(t => ({ ...t, isPlaying: false }));
  };

  const handleStop = () => {
    audioEngine.stop();
    setTransport(t => ({ ...t, isPlaying: false, currentBeat: 0 }));
  };

  const handleRewind = () => {
    audioEngine.seek(0);
    setTransport(t => ({ ...t, currentBeat: 0 }));
  };

  const handleSeek = (b: number) => {
    audioEngine.seek(b);
    setTransport(t => ({ ...t, currentBeat: b }));
  };

  const handleToggleLoop = () => {
    setProject(p => {
      const v = !p.loopEnabled;
      setTransport(t => ({ ...t, loop: v }));
      return { ...p, loopEnabled: v };
    });
  };

  const handleToggleMetronome = () => {
    setTransport(t => ({ ...t, metronome: !t.metronome }));
  };

  const handleToggleRecord = async () => {
    if (transport.isRecording) {
      const clip = await audioEngine.stopRecording(project.bpm);
      if (clip) {
        updateWithHistory(p => ({ ...p, clips: [...p.clips, clip] }));
        setSelectedClipId(clip.id);
      }
      setTransport(t => ({ ...t, isRecording: false }));
    } else {
      const armed = project.tracks.find(t => t.armed) || project.tracks[0];
      if (!armed) return;
      const ok = await audioEngine.startRecording(armed.id, transport.currentBeat);
      if (ok) {
        setTransport(t => ({ ...t, isRecording: true }));
        if (!transport.isPlaying) handlePlay();
      } else {
        alert('Microphone access denied. Please allow microphone permissions in browser settings.');
      }
    }
  };

  const handleUndo = () => {
    const p = ProjectStore.undo(project);
    if (p) setProject(p);
  };

  const handleRedo = () => {
    const p = ProjectStore.redo(project);
    if (p) setProject(p);
  };

  const handleExportWav = async () => {
    try {
      const blob = await audioEngine.renderProjectToWav(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_master.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed.');
    }
  };

  const handleExportStems = async () => {
    try {
      const stems = await audioEngine.renderStems(project);
      stems.forEach(stem => {
        const url = URL.createObjectURL(stem.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_${stem.name}`;
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch {
      alert('Stem export failed.');
    }
  };

  const handleExportMidi = () => {
    const instrumentClip = project.clips.find(c => c.type === 'instrument' && c.notes && c.notes.length > 0);
    if (!instrumentClip) {
      alert('No MIDI notes found in project to export.');
      return;
    }
    const midiBlob = exportTrackToMidiBlob(instrumentClip, project.bpm);
    const url = URL.createObjectURL(midiBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddTrackWithClip = (newTrack: Track, newClip: Clip) => {
    updateWithHistory(p => ({
      ...p,
      tracks: [...p.tracks, newTrack],
      clips: [...p.clips, newClip]
    }));
    setSelectedTrackId(newTrack.id);
    setSelectedClipId(newClip.id);
  };

  // Track operations
  const handleUpdateTrack = (id: string, u: Partial<Track>) => {
    setProject(p => ({ ...p, tracks: p.tracks.map(t => t.id === id ? { ...t, ...u } : t) }));
  };

  const handleAddTrack = (type: TrackType) => {
    const colors: Record<TrackType, string> = {
      drum: '#0284c7',
      instrument: '#6366f1',
      audio: '#d93829',
      sampler: '#d97706'
    };
    const names: Record<TrackType, string> = {
      drum: 'Drum Machine',
      instrument: 'Virtual Instrument',
      audio: 'Voice / Mic',
      sampler: 'Sampler Pads'
    };

    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `${names[type]} ${project.tracks.length + 1}`,
      type,
      color: colors[type],
      volume: 0.9,
      pan: 0,
      muted: false,
      soloed: false,
      armed: type === 'audio',
      monitoring: type === 'audio',
      vocalPreset: type === 'audio' ? 'autopitch' : undefined,
      instrumentPreset: type === 'instrument' ? 'grand_piano' : undefined,
      effects: type === 'audio' ? getVocalPreset('autopitch').effects : [],
      automation: []
    };

    updateWithHistory(p => ({ ...p, tracks: [...p.tracks, newTrack] }));
    setSelectedTrackId(newTrack.id);
  };

  const handleDeleteTrack = (id: string) => {
    updateWithHistory(p => ({
      ...p,
      tracks: p.tracks.filter(t => t.id !== id),
      clips: p.clips.filter(c => c.trackId !== id)
    }));
    if (selectedTrackId === id) setSelectedTrackId(project.tracks[0]?.id || '');
  };

  const handleDuplicateTrack = (id: string) => {
    const t = project.tracks.find(x => x.id === id);
    if (!t) return;
    const newId = `track-${Date.now()}`;
    const dup: Track = { ...t, id: newId, name: `${t.name} (Copy)` };
    const dupClips = project.clips.filter(c => c.trackId === id).map(c => ({
      ...c,
      id: `clip-${Date.now()}-${Math.random()}`,
      trackId: newId
    }));
    updateWithHistory(p => ({ ...p, tracks: [...p.tracks, dup], clips: [...p.clips, ...dupClips] }));
  };

  // Clip operations
  const handleUpdateClip = (id: string, u: Partial<Clip>) => {
    setProject(p => ({ ...p, clips: p.clips.map(c => c.id === id ? { ...c, ...u } : c) }));
  };

  const handleDeleteClip = (id: string) => {
    updateWithHistory(p => ({ ...p, clips: p.clips.filter(c => c.id !== id) }));
    setSelectedClipId(null);
  };

  const handleDuplicateClip = (id: string) => {
    const c = project.clips.find(x => x.id === id);
    if (!c) return;
    const dup: Clip = {
      ...c,
      id: `clip-${Date.now()}`,
      name: `${c.name} (Copy)`,
      startBeat: c.startBeat + c.durationBeats
    };
    updateWithHistory(p => ({ ...p, clips: [...p.clips, dup] }));
    setSelectedClipId(dup.id);
  };

  const handleSplitClip = (id: string, atBeat: number) => {
    const c = project.clips.find(x => x.id === id);
    if (!c || atBeat <= c.startBeat || atBeat >= c.startBeat + c.durationBeats) return;
    const d1 = atBeat - c.startBeat;
    const first: Clip = { ...c, durationBeats: d1 };
    const second: Clip = {
      ...c,
      id: `clip-${Date.now()}`,
      name: `${c.name} Pt.2`,
      startBeat: atBeat,
      durationBeats: c.durationBeats - d1,
      offsetBeat: c.offsetBeat + d1
    };
    updateWithHistory(p => ({ ...p, clips: p.clips.map(x => x.id === id ? first : x).concat(second) }));
    setSelectedClipId(second.id);
  };

  const handleAddClipToTrack = (clip: Clip) => {
    updateWithHistory(p => ({ ...p, clips: [...p.clips, clip] }));
    setSelectedClipId(clip.id);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const ctx = audioEngine.getContext();
    try {
      const buf = await ctx.decodeAudioData(arrayBuffer);
      const peaks = extractWaveformPeaks(buf, 120);
      const target = project.tracks.find(t => t.id === selectedTrackId && t.type === 'audio')
        || project.tracks.find(t => t.type === 'audio') || project.tracks[0];
      const durBeats = Math.max(1, Math.round((buf.duration / 60) * project.bpm * 4) / 4);
      const clip: Clip = {
        id: `import-${Date.now()}`,
        trackId: target.id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        startBeat: 0,
        durationBeats: durBeats,
        offsetBeat: 0,
        type: 'audio',
        color: '#d93829',
        gain: 1,
        pan: 0,
        audio: {
          buffer: buf,
          durationSeconds: buf.duration,
          sampleRate: buf.sampleRate,
          channels: buf.numberOfChannels,
          waveformPeaks: peaks
        }
      };
      handleAddClipToTrack(clip);
    } catch {
      alert('Could not decode audio file.');
    }
    e.target.value = '';
  };

  // Live recording notes from Virtual Piano
  const handleLiveRecordNote = (pitch: number) => {
    if (!transport.isRecording) return;
    const instTrack = project.tracks.find(t => t.id === selectedTrackId && t.type === 'instrument');
    if (!instTrack) return;

    let targetClip = project.clips.find(c => c.trackId === instTrack.id && c.type === 'instrument');
    const noteStart = Math.round(transport.currentBeat * 4) / 4;
    const newNote: MidiNote = {
      id: `rec-note-${Date.now()}-${Math.random()}`,
      pitch,
      startBeat: noteStart,
      durationBeats: 0.5,
      velocity: 100
    };

    if (targetClip) {
      handleUpdateClip(targetClip.id, {
        notes: [...(targetClip.notes || []), newNote]
      });
    } else {
      const freshClip: Clip = {
        id: `rec-midi-${Date.now()}`,
        trackId: instTrack.id,
        name: 'Recorded MIDI Take',
        startBeat: 0,
        durationBeats: 16,
        offsetBeat: 0,
        type: 'instrument',
        color: instTrack.color,
        gain: 1,
        pan: 0,
        notes: [newNote]
      };
      handleAddClipToTrack(freshClip);
    }
  };

  const selectedTrack = project.tracks.find(t => t.id === selectedTrackId) || null;
  const selectedClip = project.clips.find(c => c.id === selectedClipId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0d10] text-[#f1f5f9] overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept="audio/*" className="hidden" />

      {/* Add Track Modal */}
      <AddTrackModal
        isOpen={showAddTrackModal}
        onClose={() => setShowAddTrackModal(false)}
        onSelectType={handleAddTrack}
        onImportClick={() => fileInputRef.current?.click()}
      />

      {/* AutoPitch Circular Dial Modal */}
      <AutoPitchModal
        isOpen={showAutoPitchModal}
        onClose={() => setShowAutoPitchModal(false)}
        project={project}
        onUpdateProject={updater => updateWithHistory(updater)}
        selectedTrackId={selectedTrackId}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={showAiAssistantModal}
        onClose={() => setShowAiAssistantModal(false)}
        project={project}
        onAddTrackWithClip={handleAddTrackWithClip}
        onUpdateProject={updater => updateWithHistory(updater)}
      />

      {/* Audio Hardware & Latency Settings Modal */}
      <AudioSettingsModal
        isOpen={showAudioSettingsModal}
        onClose={() => setShowAudioSettingsModal(false)}
      />

      {/* Top Navigation */}
      <TopNav
        project={project}
        transport={transport}
        onUpdateProject={updater => updateWithHistory(updater)}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onRewind={handleRewind}
        onToggleRecord={handleToggleRecord}
        onToggleLoop={handleToggleLoop}
        onToggleMetronome={handleToggleMetronome}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportWav={handleExportWav}
        onExportStems={handleExportStems}
        onExportMidi={handleExportMidi}
        onSetTool={(tool: ToolMode) => setTransport(t => ({ ...t, activeTool: tool }))}
        onToggleAutomation={() => setTransport(t => ({ ...t, showAutomation: !t.showAutomation }))}
        onToggleLyrics={() => setShowLyrics(prev => !prev)}
        onOpenAutoPitch={() => setShowAutoPitchModal(true)}
        onOpenAiAssistant={() => setShowAiAssistantModal(true)}
        onOpenAudioSettings={() => setShowAudioSettingsModal(true)}
        masterPeak={masterPeak}
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Strip Headers */}
        <TrackList
          tracks={project.tracks}
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
          onUpdateTrack={handleUpdateTrack}
          onOpenAddTrackModal={() => setShowAddTrackModal(true)}
          onDeleteTrack={handleDeleteTrack}
          onDuplicateTrack={handleDuplicateTrack}
        />

        {/* Central Multitrack Canvas */}
        <ArrangementTimeline
          project={project}
          currentBeat={transport.currentBeat}
          selectedClipId={selectedClipId}
          activeTool={transport.activeTool}
          showAutomation={transport.showAutomation}
          onSelectClip={id => {
            setSelectedClipId(id);
            if (id) {
              const c = project.clips.find(x => x.id === id);
              if (c) setSelectedTrackId(c.trackId);
            }
          }}
          onUpdateClip={handleUpdateClip}
          onDeleteClip={handleDeleteClip}
          onDuplicateClip={handleDuplicateClip}
          onSplitClip={handleSplitClip}
          onSeek={handleSeek}
          onUpdateProject={updater => updateWithHistory(updater)}
        />

        {/* Right Library Sidebar */}
        <SidebarLibrary
          tracks={project.tracks}
          selectedTrackId={selectedTrackId}
          onAddClipToTrack={handleAddClipToTrack}
        />

        {/* Slide-over Lyrics Notepad */}
        <LyricsPad
          isOpen={showLyrics}
          onClose={() => setShowLyrics(false)}
          lyrics={project.lyrics || ''}
          onUpdateLyrics={text => updateWithHistory(p => ({ ...p, lyrics: text }))}
          projectName={project.name}
        />
      </div>

      {/* Bottom Switchable Editor Panels */}
      <BottomPanel
        project={project}
        selectedTrack={selectedTrack}
        selectedClip={selectedClip}
        onUpdateClipNotes={(cid, notes) => handleUpdateClip(cid, { notes })}
        onUpdateDrumSteps={(cid, steps) => handleUpdateClip(cid, { drumSteps: steps })}
        onAddPatternToTimeline={steps => {
          const dt = project.tracks.find(t => t.type === 'drum') || project.tracks[0];
          const clip: Clip = {
            id: `drum-${Date.now()}`,
            trackId: dt.id,
            name: `Pattern ${project.clips.filter(c => c.type === 'drum').length + 1}`,
            startBeat: Math.round(transport.currentBeat),
            durationBeats: 4,
            offsetBeat: 0,
            type: 'drum',
            color: '#0284c7',
            gain: 1,
            pan: 0,
            drumSteps: [...steps]
          };
          handleAddClipToTrack(clip);
        }}
        onUpdateClip={handleUpdateClip}
        onUpdateTrack={handleUpdateTrack}
        onUpdateTrackEffects={(tid, fx) => handleUpdateTrack(tid, { effects: fx })}
        onUpdateTrackPreset={(tid, preset) => handleUpdateTrack(tid, { instrumentPreset: preset })}
        onLiveRecordNote={handleLiveRecordNote}
        masterPeak={masterPeak}
      />
    </div>
  );
};

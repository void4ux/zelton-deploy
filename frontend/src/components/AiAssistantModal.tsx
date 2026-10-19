import React, { useState } from 'react';
import { Sparkles, Music, Disc, Wand2, X, Plus, Play, Check } from 'lucide-react';
import { Project, Track, Clip, DrumStep, MidiNote } from '../types/daw';
import { AiAssistantEngine, CHORD_PRESETS, ChordSuggestion } from '../ai/aiAssistantEngine';
import { audioEngine } from '../audio/AudioEngine';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onAddTrackWithClip: (track: Track, clip: Clip) => void;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  project,
  onAddTrackWithClip,
  onUpdateProject
}) => {
  const [activeTab, setActiveTab] = useState<'chords' | 'drums' | 'theory'>('chords');
  const [selectedGenre, setSelectedGenre] = useState<string>('trap');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentChords = CHORD_PRESETS[selectedGenre] || CHORD_PRESETS.trap;

  const handleApplyChords = (chord: ChordSuggestion) => {
    const notes = AiAssistantEngine.generateChordNotes(chord);
    const newTrack: Track = {
      id: `track-ai-piano-${Date.now()}`,
      name: `${chord.name.split('(')[0].trim()}`,
      type: 'instrument',
      color: '#f59e0b',
      volume: 0.85,
      pan: 0,
      muted: false,
      soloed: false,
      armed: false,
      monitoring: false,
      instrumentPreset: 'grand_piano',
      effects: [
        {
          id: `fx-rev-${Date.now()}`,
          type: 'reverb',
          enabled: true,
          params: { decay: 2.2, wet: 28 }
        }
      ],
      automation: []
    };

    const newClip: Clip = {
      id: `clip-ai-chords-${Date.now()}`,
      trackId: newTrack.id,
      name: `${chord.name.split('(')[0].trim()}`,
      startBeat: 0,
      durationBeats: 16,
      offsetBeat: 0,
      type: 'instrument',
      color: '#f59e0b',
      gain: 1,
      pan: 0,
      notes
    };

    onAddTrackWithClip(newTrack, newClip);
    setCopiedNotification(`Created track: ${newTrack.name}`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleApplyBassline = (chord: ChordSuggestion) => {
    const bassNotes = AiAssistantEngine.generateBassline(chord);
    const newTrack: Track = {
      id: `track-ai-bass-${Date.now()}`,
      name: `${chord.name.split('(')[0].trim()} Bass`,
      type: 'instrument',
      color: '#10b981',
      volume: 0.9,
      pan: 0,
      muted: false,
      soloed: false,
      armed: false,
      monitoring: false,
      instrumentPreset: 'sub_808',
      effects: [],
      automation: []
    };

    const newClip: Clip = {
      id: `clip-ai-bass-${Date.now()}`,
      trackId: newTrack.id,
      name: `808 Sub Bassline`,
      startBeat: 0,
      durationBeats: 16,
      offsetBeat: 0,
      type: 'instrument',
      color: '#10b981',
      gain: 1,
      pan: 0,
      notes: bassNotes
    };

    onAddTrackWithClip(newTrack, newClip);
    setCopiedNotification(`Created bassline: ${newTrack.name}`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleApplyDrumPattern = (genre: 'trap' | 'boombap' | 'house' | 'drill') => {
    const steps = AiAssistantEngine.generateDrumPattern(genre);
    const newTrack: Track = {
      id: `track-ai-drum-${Date.now()}`,
      name: `AI ${genre.toUpperCase()} Beat`,
      type: 'drum',
      color: '#0284c7',
      volume: 0.95,
      pan: 0,
      muted: false,
      soloed: false,
      armed: false,
      monitoring: false,
      effects: [],
      automation: []
    };

    const newClip: Clip = {
      id: `clip-ai-drum-${Date.now()}`,
      trackId: newTrack.id,
      name: `${genre.toUpperCase()} 16-Step`,
      startBeat: 0,
      durationBeats: 4,
      offsetBeat: 0,
      type: 'drum',
      color: '#0284c7',
      gain: 1,
      pan: 0,
      drumSteps: steps
    };

    onAddTrackWithClip(newTrack, newClip);
    setCopiedNotification(`Created drum pattern: ${newTrack.name}`);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-[#272e42] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-[#151720] border-b border-[#242938] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#222736] text-slate-100 flex items-center justify-center border border-[#333b52]">
              <Sparkles className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                SonicForge AI Studio Assistant
              </h2>
              <p className="text-xs text-slate-400">Generate chords, basslines, beats, and song structures directly into your timeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#202638] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#202535] bg-[#141620]">
          <button
            onClick={() => setActiveTab('chords')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'chords'
                ? 'text-white border-[#d97706] bg-[#1c202d]'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Chord Progressions</span>
          </button>
          <button
            onClick={() => setActiveTab('drums')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'drums'
                ? 'text-white border-[#0284c7] bg-[#1c202d]'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Drum Grooves</span>
          </button>
          <button
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'theory'
                ? 'text-white border-[#6366f1] bg-[#1c202d]'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Music Theory & Mixing Advice</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {copiedNotification && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{copiedNotification}</span>
            </div>
          )}

          {activeTab === 'chords' && (
            <div className="space-y-4">
              {/* Genre Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Genre Style:</span>
                {['trap', 'pop', 'rnb', 'lofi'].map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(g)}
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition ${
                      selectedGenre === g
                        ? 'bg-[#282f42] text-white border border-[#3d4663]'
                        : 'bg-[#181a24] text-slate-400 hover:text-white border border-[#232838]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Chord Progression Cards */}
              <div className="grid grid-cols-1 gap-3">
                {currentChords.map((chord, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#161822] border border-[#252b3c] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{chord.name}</span>
                        <span className="text-[10px] bg-[#222736] text-slate-300 px-2 py-0.5 rounded font-mono font-bold">
                          {chord.genre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {chord.progression.map((cName, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[#10121a] border border-[#232839] text-amber-400 font-mono font-bold text-xs rounded"
                          >
                            {cName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApplyChords(chord)}
                        className="px-3 py-1.5 bg-[#d93829] hover:bg-[#b91c1c] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert Piano Chords</span>
                      </button>
                      <button
                        onClick={() => handleApplyBassline(chord)}
                        className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add 808 Bass</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'drums' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Instantly generate genre-authentic 16-step beat patterns with velocity dynamics</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'trap', name: '808 Trap Rolling Hats', desc: 'Syncopated kick, hard clap on 4/12, 16th rolling hats' },
                  { id: 'boombap', name: '90s Boom Bap Swing', desc: 'Organic offbeat kick, punchy snare, open hats' },
                  { id: 'house', name: 'Four On The Floor', desc: 'Driving 4/4 kick with offbeat open hats' },
                  { id: 'drill', name: 'UK/NY Drill Bounce', desc: 'Sliding kick pattern with triplet accent hi-hats' }
                ].map((item: any) => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#161822] border border-[#252b3c] flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleApplyDrumPattern(item.id)}
                      className="w-full py-2 bg-[#1b2230] hover:bg-[#232d40] text-[#38bdf8] border border-[#38bdf8]/30 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create {item.id.toUpperCase()} Track</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'theory' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-[#191c28] border border-[#2b3348]">
                <h4 className="font-extrabold text-sm text-white mb-2">Project Scale & Key Intelligence</h4>
                <p className="mb-2">
                  Your project is currently set to <span className="text-[#d93829] font-bold">{project.keyRoot} {project.keyScale}</span> at <span className="text-[#0284c7] font-bold">{project.bpm} BPM</span>.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-[#12141c] p-2.5 rounded-lg border border-[#242b3c]">
                    <span className="text-slate-400 block text-[10px] font-sans">TONIC & ROOT:</span>
                    <span className="text-white font-bold">{project.keyRoot} (MIDI Note 60)</span>
                  </div>
                  <div className="bg-[#12141c] p-2.5 rounded-lg border border-[#242b3c]">
                    <span className="text-slate-400 block text-[10px] font-sans">RECOMMENDED VOCAL EQ:</span>
                    <span className="text-white font-bold">Cut 250Hz boxiness, Boost 12kHz air</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#191c28] border border-[#2b3348]">
                <h4 className="font-extrabold text-sm text-white mb-2">Arrangement Structure Guide</h4>
                <div className="flex items-center gap-2 font-mono text-[11px] overflow-x-auto py-1">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">Intro (4 Bars)</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">Verse 1 (8 Bars)</span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">Pre-Chorus (4 Bars)</span>
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded border border-red-500/30">Chorus (8 Bars)</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">Outro (4 Bars)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

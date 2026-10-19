import React, { useState } from 'react';
import { Piano, Disc, Sliders, Scissors, Wand2, Layers, Music, ChevronDown, ChevronUp } from 'lucide-react';
import { Project, Track, Clip, MidiNote, DrumStep, EffectConfig, InstrumentPresetType } from '../types/daw';
import { VirtualPiano } from './VirtualPiano';
import { PianoRoll } from './PianoRoll';
import { DrumSequencer } from './DrumSequencer';
import { MixerConsole } from './MixerConsole';
import { EffectsRack } from './EffectsRack';
import { AudioClipEditor } from './AudioClipEditor';
import { SamplerPadMatrix } from './SamplerPadMatrix';

export type BottomTab = 'instrument' | 'piano-roll' | 'drums' | 'sampler' | 'fx' | 'mixer' | 'audio-editor';

interface BottomPanelProps {
  project: Project;
  selectedTrack: Track | null;
  selectedClip: Clip | null;
  onUpdateClipNotes: (clipId: string, notes: MidiNote[]) => void;
  onUpdateDrumSteps: (clipId: string, steps: DrumStep[]) => void;
  onAddPatternToTimeline: (steps: DrumStep[]) => void;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onUpdateTrackEffects: (trackId: string, effects: EffectConfig[]) => void;
  onUpdateTrackPreset: (trackId: string, preset: InstrumentPresetType) => void;
  onLiveRecordNote?: (pitch: number) => void;
  masterPeak: number;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  project,
  selectedTrack,
  selectedClip,
  onUpdateClipNotes,
  onUpdateDrumSteps,
  onAddPatternToTimeline,
  onUpdateClip,
  onUpdateTrack,
  onUpdateTrackEffects,
  onUpdateTrackPreset,
  onLiveRecordNote,
  masterPeak
}) => {
  const [activeTab, setActiveTab] = useState<BottomTab>('instrument');
  const [collapsed, setCollapsed] = useState(false);

  const tabs: { id: BottomTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'instrument',   label: 'Instrument', icon: <Music className="w-3.5 h-3.5" />,    color: '#d97706' },
    { id: 'piano-roll',   label: 'MIDI Editor',icon: <Piano className="w-3.5 h-3.5" />,    color: '#6366f1' },
    { id: 'drums',        label: 'Drums',      icon: <Disc className="w-3.5 h-3.5" />,     color: '#0284c7' },
    { id: 'sampler',      label: 'Sampler',    icon: <Layers className="w-3.5 h-3.5" />,   color: '#b45309' },
    { id: 'fx',           label: 'Effects',    icon: <Wand2 className="w-3.5 h-3.5" />,    color: '#d93829' },
    { id: 'mixer',        label: 'Mixer',      icon: <Sliders className="w-3.5 h-3.5" />,  color: '#059669' },
    { id: 'audio-editor', label: 'Audio Clip', icon: <Scissors className="w-3.5 h-3.5" />, color: '#0284c7' },
  ];

  return (
    <div className={`border-t border-[#252a38] bg-[#0e1015] flex flex-col transition-all duration-200 select-none ${collapsed ? 'h-8' : 'h-72'}`}>
      {/* Tab bar */}
      <div className="h-8 px-2 bg-[#151720] border-b border-[#252a38] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-0.5">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setCollapsed(false); }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition ${
                activeTab === t.id && !collapsed
                  ? 'bg-[#1f2433] text-slate-100 border border-[#353d52]'
                  : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}
            >
              <span style={activeTab === t.id && !collapsed ? { color: t.color } : {}}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 text-[#64748b] hover:text-white rounded transition">
          {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          {activeTab === 'instrument' && (
            <VirtualPiano
              track={selectedTrack}
              keyRoot={project.keyRoot}
              keyScale={project.keyScale}
              onUpdateTrackPreset={preset => {
                if (selectedTrack) onUpdateTrackPreset(selectedTrack.id, preset);
              }}
              onPlayNote={onLiveRecordNote}
            />
          )}
          {activeTab === 'piano-roll' && (
            <PianoRoll
              clip={selectedClip?.type === 'instrument' ? selectedClip : null}
              bpm={project.bpm}
              keyRoot={project.keyRoot}
              keyScale={project.keyScale}
              onUpdateClipNotes={notes => { if (selectedClip) onUpdateClipNotes(selectedClip.id, notes); }}
            />
          )}
          {activeTab === 'drums' && (
            <DrumSequencer
              clip={selectedClip?.type === 'drum' ? selectedClip : null}
              onUpdateDrumSteps={steps => { if (selectedClip) onUpdateDrumSteps(selectedClip.id, steps); }}
              onAddPatternToTimeline={onAddPatternToTimeline}
            />
          )}
          {activeTab === 'sampler' && <SamplerPadMatrix />}
          {activeTab === 'fx' && (
            <EffectsRack
              track={selectedTrack}
              onUpdateTrackEffects={fx => { if (selectedTrack) onUpdateTrackEffects(selectedTrack.id, fx); }}
            />
          )}
          {activeTab === 'mixer' && <MixerConsole project={project} onUpdateTrack={onUpdateTrack} masterPeak={masterPeak} />}
          {activeTab === 'audio-editor' && (
            <AudioClipEditor
              clip={selectedClip?.type === 'audio' ? selectedClip : null}
              onUpdateClip={up => { if (selectedClip) onUpdateClip(selectedClip.id, up); }}
            />
          )}
        </div>
      )}
    </div>
  );
};

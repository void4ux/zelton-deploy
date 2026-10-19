import React, { useState } from 'react';
import { Sparkles, X, Volume2, Music, Check } from 'lucide-react';
import { Project, KeyScale } from '../types/daw';

interface AutoPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
  selectedTrackId: string;
}

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SPEEDS = [
  { label: 'OFF', val: 0, desc: 'Bypassed' },
  { label: 'LIGHT', val: 25, desc: 'Natural pitch assist' },
  { label: 'MEDIUM', val: 50, desc: 'Smooth vocal tuning' },
  { label: 'HARD', val: 75, desc: 'Modern trap tuning' },
  { label: 'ROBOT', val: 100, desc: 'Hard quantized T-Pain snap' },
];

export const AutoPitchModal: React.FC<AutoPitchModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
  selectedTrackId
}) => {
  const [speedVal, setSpeedVal] = useState<number>(100);
  const [depthVal, setDepthVal] = useState<number>(100);

  if (!isOpen) return null;

  const currentTrack = project.tracks.find(t => t.id === selectedTrackId);

  const applyPitchToTrack = () => {
    onUpdateProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => {
        if (t.id === selectedTrackId) {
          const fxIndex = t.effects.findIndex(e => e.type === 'autopitch');
          if (fxIndex >= 0) {
            const nextFx = [...t.effects];
            nextFx[fxIndex] = {
              ...nextFx[fxIndex],
              enabled: speedVal > 0,
              params: { speed: speedVal, depth: depthVal }
            };
            return { ...t, effects: nextFx, vocalPreset: speedVal > 0 ? 'autopitch' : 'none' };
          } else {
            return {
              ...t,
              vocalPreset: 'autopitch',
              effects: [
                ...t.effects,
                {
                  id: `fx-ap-${Date.now()}`,
                  type: 'autopitch',
                  enabled: true,
                  params: { speed: speedVal, depth: depthVal }
                }
              ]
            };
          }
        }
        return t;
      })
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#14161f] border border-[#2b334a] rounded-3xl w-full max-w-lg p-7 shadow-2xl relative flex flex-col gap-6 select-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242b3d] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                AutoPitch
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40">
                  REAL-TIME DSP
                </span>
              </h2>
              <span className="text-[11px] text-[#64748b]">
                {currentTrack ? `Applying to: ${currentTrack.name}` : 'Select a track to apply'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#202638] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Circular LED Tuning Dial */}
        <div className="flex flex-col items-center justify-center py-4 bg-[#0d0f17] rounded-2xl border border-[#1f2538] relative">
          <div className="w-40 h-40 rounded-full border-4 border-[#242b3d] flex flex-col items-center justify-center relative shadow-inner">
            {/* Outer LED arc */}
            <div
              className="absolute inset-0 rounded-full border-4 border-[#0284c7] border-t-transparent transition-all duration-300"
              style={{
                transform: `rotate(${speedVal * 2.7 - 135}deg)`
              }}
            />
            <span className="text-[10px] font-mono font-bold text-[#64748b] uppercase tracking-wider">
              CORRECTION SPEED
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1">
              {SPEEDS.find(s => s.val === speedVal)?.label || `${speedVal}%`}
            </span>
            <span className="text-[10px] text-[#38bdf8] font-semibold mt-1">
              {project.keyRoot} {project.keyScale.toUpperCase()}
            </span>
          </div>

          {/* Speed Preset Steps */}
          <div className="flex items-center gap-1.5 mt-5">
            {SPEEDS.map(s => (
              <button
                key={s.val}
                onClick={() => setSpeedVal(s.val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                  speedVal === s.val
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'bg-[#191d2c] text-[#64748b] hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Musical Key & Scale Configuration */}
        <div className="grid grid-cols-2 gap-3">
          {/* Key Root */}
          <div className="flex flex-col gap-1.5 bg-[#1a1e2b] p-3 rounded-xl border border-[#272e42]">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
              SONG KEY ROOT
            </span>
            <div className="grid grid-cols-6 gap-1">
              {KEYS.map(k => (
                <button
                  key={k}
                  onClick={() => onUpdateProject(p => ({ ...p, keyRoot: k }))}
                  className={`py-1 rounded text-xs font-bold font-mono transition ${
                    project.keyRoot === k
                      ? 'bg-[#d93829] text-white shadow-sm'
                      : 'bg-[#131622] text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Type */}
          <div className="flex flex-col gap-1.5 bg-[#1a1e2b] p-3 rounded-xl border border-[#272e42]">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
              SCALE MODE
            </span>
            <div className="flex flex-col gap-1.5">
              {(['minor', 'major', 'pentatonic', 'chromatic'] as KeyScale[]).map(sc => (
                <button
                  key={sc}
                  onClick={() => onUpdateProject(p => ({ ...p, keyScale: sc }))}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold text-left transition flex items-center justify-between ${
                    project.keyScale === sc
                      ? 'bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40'
                      : 'bg-[#131622] text-[#94a3b8] hover:text-white'
                  }`}
                >
                  <span className="capitalize">{sc} Scale</span>
                  {project.keyScale === sc && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#242b3d] pt-4">
          <span className="text-[11px] text-[#64748b]">
            AutoPitch detects and snaps live vocal notes to {project.keyRoot} {project.keyScale}.
          </span>
          <button
            onClick={applyPitchToTrack}
            className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            Apply AutoPitch
          </button>
        </div>
      </div>
    </div>
  );
};

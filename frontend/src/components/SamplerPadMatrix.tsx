import React, { useEffect, useState } from 'react';
import { SamplerPad } from '../types/daw';
import { audioEngine } from '../audio/AudioEngine';
import { Volume2, Sparkles, Layers } from 'lucide-react';

interface SamplerPadMatrixProps {
  onTriggerPad?: (pitch: number) => void;
}

const DEFAULT_PADS: SamplerPad[] = [
  { id: 0, name: '808 Sub Kick', keyLabel: '1', pitch: 36, color: '#d93829' },
  { id: 1, name: 'Punch Snare', keyLabel: '2', pitch: 38, color: '#0284c7' },
  { id: 2, name: 'Trap Clap', keyLabel: '3', pitch: 39, color: '#d97706' },
  { id: 3, name: 'Rimshot Perc', keyLabel: '4', pitch: 42, color: '#059669' },
  { id: 4, name: 'Closed Hat A', keyLabel: 'Q', pitch: 42, color: '#6366f1' },
  { id: 5, name: 'Closed Hat B', keyLabel: 'W', pitch: 42, color: '#6366f1' },
  { id: 6, name: 'Open Hi-Hat', keyLabel: 'E', pitch: 46, color: '#9333ea' },
  { id: 7, name: 'Crash Cymbal', keyLabel: 'R', pitch: 46, color: '#0ea5e9' },
  { id: 8, name: 'Low Tom 808', keyLabel: 'A', pitch: 45, color: '#d93829' },
  { id: 9, name: 'Mid Tom', keyLabel: 'S', pitch: 47, color: '#d97706' },
  { id: 10, name: 'Laser FX', keyLabel: 'D', pitch: 72, color: '#0284c7' },
  { id: 11, name: 'Chant Vox', keyLabel: 'F', pitch: 60, color: '#059669' },
  { id: 12, name: '808 Bass C1', keyLabel: 'Z', pitch: 36, color: '#6366f1' },
  { id: 13, name: '808 Bass D#1', keyLabel: 'X', pitch: 39, color: '#6366f1' },
  { id: 14, name: '808 Bass F1', keyLabel: 'C', pitch: 41, color: '#6366f1' },
  { id: 15, name: '808 Bass G1', keyLabel: 'V', pitch: 43, color: '#6366f1' },
];

export const SamplerPadMatrix: React.FC<SamplerPadMatrixProps> = ({ onTriggerPad }) => {
  const [activePadId, setActivePadId] = useState<number | null>(null);
  const [padVelocity, setPadVelocity] = useState<number>(100);

  const trigger = (pad: SamplerPad) => {
    setActivePadId(pad.id);
    if (pad.pitch >= 60) {
      audioEngine.previewNote(pad.pitch, padVelocity);
    } else {
      audioEngine.previewDrum(pad.pitch, padVelocity);
    }
    if (onTriggerPad) onTriggerPad(pad.pitch);
    setTimeout(() => setActivePadId(null), 120);
  };

  // Keyboard trigger mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const pad = DEFAULT_PADS.find(p => p.keyLabel.toUpperCase() === key);
      if (pad) {
        trigger(pad);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [padVelocity]);

  return (
    <div className="h-full flex flex-col bg-[#11131a] select-none text-xs p-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#242938]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#d93829]" />
          <span className="font-bold text-slate-200">16-Pad Live Sampler</span>
          <span className="text-[10px] text-[#64748b] font-mono">
            QWERTY Map: [1-4] [Q-R] [A-F] [Z-V]
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <Volume2 className="w-3.5 h-3.5 text-[#d93829]" />
          <span>Velocity: {padVelocity}</span>
          <input
            type="range"
            min="20"
            max="127"
            value={padVelocity}
            onChange={(e) => setPadVelocity(parseInt(e.target.value))}
            className="w-24 accent-[#d93829] h-1.5"
          />
        </div>
      </div>

      {/* 4x4 Responsive Grid */}
      <div className="flex-1 grid grid-cols-4 grid-rows-4 gap-2.5">
        {DEFAULT_PADS.map((pad) => {
          const isPressed = activePadId === pad.id;

          return (
            <button
              key={pad.id}
              onClick={() => trigger(pad)}
              style={{
                borderColor: isPressed ? '#ffffff' : `${pad.color}44`,
                boxShadow: isPressed ? `0 0 16px ${pad.color}` : 'none'
              }}
              className={`rounded-xl border-2 p-2.5 flex flex-col justify-between items-start transition-all duration-75 active:scale-95 ${
                isPressed
                  ? 'bg-white text-black font-extrabold'
                  : 'bg-[#181b26] hover:bg-[#202534] text-slate-200'
              }`}
            >
              <div className="flex justify-between w-full">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: pad.color }}
                />
                <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                  {pad.keyLabel}
                </span>
              </div>

              <div className="flex flex-col text-left">
                <span className="font-bold text-xs truncate">{pad.name}</span>
                <span className="text-[9px] font-mono opacity-60">Pitch {pad.pitch}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

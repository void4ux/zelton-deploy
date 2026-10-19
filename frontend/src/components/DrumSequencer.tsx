import React, { useState } from 'react';
import { DrumStep, Clip, DrumKitType } from '../types/daw';
import { audioEngine } from '../audio/AudioEngine';
import { Volume2, Trash2, Plus, Sparkles, Sliders } from 'lucide-react';

interface DrumSequencerProps {
  clip: Clip | null;
  onUpdateDrumSteps: (steps: DrumStep[]) => void;
  onAddPatternToTimeline: (steps: DrumStep[]) => void;
}

const CHANNELS = [
  { pitch: 36, name: 'Kick 808', color: '#d93829' },
  { pitch: 38, name: 'Snare', color: '#0284c7' },
  { pitch: 39, name: 'Clap', color: '#6366f1' },
  { pitch: 42, name: 'Closed HH', color: '#d97706' },
  { pitch: 46, name: 'Open HH', color: '#b45309' },
  { pitch: 45, name: 'Tom Low', color: '#059669' }
];

const KITS: { id: DrumKitType; name: string }[] = [
  { id: '808_trap', name: '808 Trap Kit' },
  { id: '909_techno', name: '909 Classic Kit' },
  { id: 'boombap', name: 'Boom Bap Vintage' },
  { id: 'lofi_chill', name: 'Lo-Fi Chill Kit' },
  { id: 'acoustic', name: 'Studio Acoustic' },
];

export const DrumSequencer: React.FC<DrumSequencerProps> = ({
  clip,
  onUpdateDrumSteps,
  onAddPatternToTimeline
}) => {
  const [vel, setVel] = useState(100);
  const [selectedKit, setSelectedKit] = useState<DrumKitType>('808_trap');
  const [activeBank, setActiveBank] = useState<'A' | 'B'>('A');
  const [swing, setSwing] = useState(0);

  const steps = clip?.drumSteps || [];
  const stepOffset = activeBank === 'A' ? 0 : 16;

  const toggle = (pitch: number, localStep: number) => {
    const globalStep = stepOffset + localStep;
    const idx = steps.findIndex(s => s.pitch === pitch && s.step === globalStep);
    let next = [...steps];
    if (idx >= 0 && next[idx].active) {
      next.splice(idx, 1);
    } else if (idx >= 0) {
      next[idx] = { ...next[idx], active: true, velocity: vel };
      audioEngine.previewDrum(pitch, vel);
    } else {
      next.push({ pitch, step: globalStep, velocity: vel, active: true });
      audioEngine.previewDrum(pitch, vel);
    }
    onUpdateDrumSteps(next);
  };

  const randomizePattern = () => {
    const randomSteps: DrumStep[] = [];
    CHANNELS.forEach(ch => {
      for (let i = 0; i < 16; i++) {
        const prob = ch.pitch === 36 ? 0.35 : ch.pitch === 42 ? 0.65 : ch.pitch === 38 ? 0.25 : 0.15;
        if (Math.random() < prob) {
          randomSteps.push({ pitch: ch.pitch, step: i, velocity: 80 + Math.floor(Math.random() * 40), active: true });
        }
      }
    });
    onUpdateDrumSteps(randomSteps);
  };

  return (
    <div className="h-full flex flex-col bg-[#0e1015] select-none text-xs">
      {/* Toolbar */}
      <div className="h-8 px-3 border-b border-[#252a38] flex items-center justify-between bg-[#151720]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-200 text-[11px]">
            Drum Machine:
          </span>

          {/* Kit selector */}
          <select
            value={selectedKit}
            onChange={(e) => setSelectedKit(e.target.value as DrumKitType)}
            className="text-[10px] font-semibold text-white bg-[#1a1c23] border border-[#2a2d38] rounded px-2 py-0.5"
          >
            {KITS.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>

          {/* Bank A / B */}
          <div className="flex items-center bg-[#171a23] rounded p-0.5 border border-[#272d3c] gap-0.5">
            <button
              onClick={() => setActiveBank('A')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                activeBank === 'A' ? 'bg-[#293042] text-white' : 'text-[#8592a6] hover:text-white'
              }`}
            >
              Bank A (1-16)
            </button>
            <button
              onClick={() => setActiveBank('B')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                activeBank === 'B' ? 'bg-[#293042] text-white' : 'text-[#8592a6] hover:text-white'
              }`}
            >
              Bank B (17-32)
            </button>
          </div>

          <button
            onClick={randomizePattern}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1b1f2b] hover:bg-[#252a3b] text-slate-300 rounded text-[10px] font-semibold border border-[#293144] transition"
          >
            <Sparkles className="w-3 h-3 text-[#d97706]" />
            <span>Randomize</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#94a3b8]">
            <Sliders className="w-3 h-3 text-[#8592a6]" />
            <span className="text-[10px]">Swing {swing}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={swing}
              onChange={e => setSwing(parseInt(e.target.value))}
              className="w-16 h-1 accent-[#cbd5e1]"
            />
          </div>

          <div className="flex items-center gap-1 text-[#94a3b8]">
            <Volume2 className="w-3 h-3 text-[#8592a6]" />
            <span className="text-[10px]">Vel {vel}</span>
            <input
              type="range"
              min="20"
              max="127"
              value={vel}
              onChange={e => setVel(parseInt(e.target.value))}
              className="w-16 h-1 accent-[#cbd5e1]"
            />
          </div>

          <button
            onClick={() => onAddPatternToTimeline(steps)}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#d93829] hover:bg-[#b91c1c] text-white rounded text-[10px] font-bold transition border border-[#b91c1c] active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Stamp to Timeline</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        {CHANNELS.map(ch => (
          <div
            key={ch.pitch}
            className="flex items-center gap-2 bg-[#141720] p-1.5 rounded-lg border border-[#222736]"
          >
            <div className="w-28 flex items-center justify-between pr-2 border-r border-[#222736]">
              <button
                onClick={() => audioEngine.previewDrum(ch.pitch, vel)}
                className="flex items-center gap-1.5 text-left font-semibold text-slate-200 hover:text-white transition"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
                <span className="truncate text-[10px]">{ch.name}</span>
              </button>
              <button
                onClick={() => onUpdateDrumSteps(steps.filter(s => s.pitch !== ch.pitch))}
                className="p-0.5 text-[#475569] hover:text-[#d93829] rounded"
                title="Clear row"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-16 gap-1">
              {Array.from({ length: 16 }).map((_, i) => {
                const globalStep = stepOffset + i;
                const on = steps.some(s => s.pitch === ch.pitch && s.step === globalStep && s.active);
                const beatStart = i % 4 === 0;

                return (
                  <button
                    key={i}
                    onClick={() => toggle(ch.pitch, i)}
                    className={`h-8 rounded transition duration-75 text-[8px] font-mono font-bold ${
                      on
                        ? 'text-white scale-[1.01]'
                        : beatStart
                        ? 'bg-[#1e2330] hover:bg-[#262c3e] text-[#64748b]'
                        : 'bg-[#171a23] hover:bg-[#1e2330] text-[#475569]'
                    }`}
                    style={on ? { backgroundColor: ch.color } : {}}
                  >
                    {globalStep + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

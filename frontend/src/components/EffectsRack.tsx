import React from 'react';
import { Sliders, Power, Trash2 } from 'lucide-react';
import { Track, EffectConfig } from '../types/daw';

interface EffectsRackProps {
  track: Track | null;
  onUpdateTrackEffects: (effects: EffectConfig[]) => void;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({ track, onUpdateTrackEffects }) => {
  if (!track) {
    return <div className="h-full flex items-center justify-center text-[#475569] text-xs">Select a track to configure its FX inserts.</div>;
  }

  const effects = track.effects;

  const toggleEffect = (id: string) => {
    onUpdateTrackEffects(effects.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  const updateParam = (id: string, key: string, val: number) => {
    onUpdateTrackEffects(effects.map(e => e.id === id ? { ...e, params: { ...e.params, [key]: val } } : e));
  };

  const addEffect = (type: EffectConfig['type']) => {
    const defaults: Record<string, Record<string, number>> = {
      eq3: { low: 0, mid: 0, high: 0 },
      compressor: { threshold: -20, ratio: 4, attack: 10, release: 200, knee: 10 },
      delay: { time: 0.25, feedback: 0.35, wet: 40 },
      reverb: { decay: 2.0, wet: 30 },
      distortion: { drive: 20, wet: 50 },
      filter: { cutoff: 2000, resonance: 2, mode: 0 },
      limiter: {},
      autopitch: { speed: 95, depth: 100 }
    };
    onUpdateTrackEffects([...effects, { id: `fx-${Date.now()}`, type, enabled: true, params: defaults[type] || {} }]);
  };

  const removeEffect = (id: string) => { onUpdateTrackEffects(effects.filter(e => e.id !== id)); };

  const rangeForParam = (key: string): [number, number, number] => {
    if (key === 'low' || key === 'mid' || key === 'high') return [-12, 12, 1];
    if (key === 'cutoff') return [20, 10000, 1];
    if (key === 'time') return [0, 2, 0.01];
    if (key === 'decay') return [0.1, 5, 0.1];
    if (key === 'drive' || key === 'speed' || key === 'depth') return [0, 100, 1];
    return [0, 100, 1];
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0d10] select-none text-xs">
      {/* Header */}
      <div className="h-7 px-3 border-b border-[#2a2d38] flex items-center justify-between bg-[#131419]">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#d93829]" />
          <span className="font-bold text-slate-200 text-[11px]">FX: {track.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {(['delay','reverb','eq3','compressor','distortion','filter','autopitch'] as EffectConfig['type'][]).map(t => (
            <button key={t} onClick={() => addEffect(t)}
              className="px-1.5 py-0.5 bg-[#1a1c23] hover:bg-[#21242e] text-[#94a3b8] rounded text-[10px] font-semibold transition capitalize">
              +{t === 'eq3' ? 'EQ' : t === 'autopitch' ? 'AutoPitch' : t}
            </button>
          ))}
        </div>
      </div>

      {/* FX Chain */}
      <div className="flex-1 overflow-x-auto p-3 flex gap-3">
        {effects.length === 0 ? (
          <div className="flex items-center justify-center w-full text-[#475569]">No effects. Click above to add.</div>
        ) : effects.map(fx => (
          <div key={fx.id} className={`w-56 bg-[#131419] rounded-xl border p-2.5 flex flex-col shrink-0 transition ${
            fx.enabled ? 'border-[#2a2d38]' : 'border-[#1a1c23] opacity-50'
          }`}>
            <div className="flex items-center justify-between border-b border-[#21242e] pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleEffect(fx.id)}
                  className={`p-1 rounded transition ${fx.enabled ? 'bg-[#d93829] text-white' : 'bg-[#21242e] text-[#475569]'}`}>
                  <Power className="w-3 h-3" />
                </button>
                <span className="font-bold text-slate-200 uppercase text-[10px] tracking-wide">
                  {fx.type === 'eq3' ? 'EQ3' : fx.type === 'autopitch' ? 'AutoPitch' : fx.type}
                </span>
              </div>
              <button onClick={() => removeEffect(fx.id)} className="p-0.5 text-[#475569] hover:text-[#d93829] rounded">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {Object.entries(fx.params).map(([key, val]) => {
                const [min, max, step] = rangeForParam(key);
                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] font-mono text-[#475569]">
                      <span className="uppercase">{key}</span>
                      <span>{typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : val}</span>
                    </div>
                    <input type="range" min={min} max={max} step={step} value={val}
                      onChange={e => updateParam(fx.id, key, parseFloat(e.target.value))}
                      className="h-1 accent-[#d93829]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

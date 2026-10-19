import React from 'react';
import { Clip } from '../types/daw';
import { Scissors, FlipHorizontal } from 'lucide-react';

interface AudioClipEditorProps {
  clip: Clip | null;
  onUpdateClip: (updates: Partial<Clip>) => void;
}

export const AudioClipEditor: React.FC<AudioClipEditorProps> = ({ clip, onUpdateClip }) => {
  if (!clip || clip.type !== 'audio') {
    return <div className="h-full flex items-center justify-center text-[#475569] text-xs">Select an audio clip to view its properties.</div>;
  }

  const audio = clip.audio;

  return (
    <div className="h-full flex flex-col bg-[#0c0d10] select-none text-xs">
      <div className="h-7 px-3 border-b border-[#2a2d38] flex items-center justify-between bg-[#131419]">
        <div className="flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-[#ec4899]" />
          <span className="font-bold text-slate-200 text-[11px]">Audio: {clip.name}</span>
        </div>
        <span className="text-[9px] font-mono text-[#475569]">{audio?.durationSeconds.toFixed(2)}s @ {audio?.sampleRate}Hz</span>
      </div>

      <div className="flex-1 p-4 flex gap-6 items-center">
        {/* Waveform */}
        <div className="flex-1 h-28 bg-[#131419] rounded-xl border border-[#2a2d38] p-2.5 flex flex-col justify-between">
          <span className="text-[9px] font-mono text-[#475569]">Waveform</span>
          <div className="flex-1 flex items-center px-1">
            {audio?.waveformPeaks && (
              <svg className="w-full h-full" preserveAspectRatio="none">
                {audio.waveformPeaks.map((pk, i) => {
                  const x = (i / audio.waveformPeaks!.length) * 100;
                  const h = Math.max(3, pk * 90);
                  return <line key={i} x1={`${x}%`} y1={`${50-h/2}%`} x2={`${x}%`} y2={`${50+h/2}%`} stroke={clip.color} strokeWidth="2" />;
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="w-60 bg-[#131419] p-3 rounded-xl border border-[#2a2d38] flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-[#475569]"><span>GAIN</span><span>{Math.round(clip.gain * 100)}%</span></div>
            <input type="range" min="0" max="2" step="0.05" value={clip.gain} onChange={e => onUpdateClip({ gain: parseFloat(e.target.value) })} className="h-1 accent-[#d93829]" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-[#475569]"><span>PAN</span><span>{clip.pan.toFixed(2)}</span></div>
            <input type="range" min="-1" max="1" step="0.05" value={clip.pan} onChange={e => onUpdateClip({ pan: parseFloat(e.target.value) })} className="h-1 accent-[#6366f1]" />
          </div>
          <button onClick={() => onUpdateClip({ reversed: !clip.reversed })}
            className={`w-full py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 text-[11px] transition ${
              clip.reversed ? 'bg-[#d93829] text-white' : 'bg-[#1a1c23] text-[#94a3b8] hover:text-white'
            }`}
          ><FlipHorizontal className="w-3.5 h-3.5" /><span>Reverse</span></button>
        </div>
      </div>
    </div>
  );
};

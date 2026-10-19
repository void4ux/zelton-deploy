import React from 'react';
import { Volume2, Sliders } from 'lucide-react';
import { Project, Track } from '../types/daw';

interface MixerConsoleProps {
  project: Project;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  masterPeak: number;
}

export const MixerConsole: React.FC<MixerConsoleProps> = ({ project, onUpdateTrack, masterPeak }) => {
  return (
    <div className="h-full bg-[#0c0d10] p-3 flex gap-3 overflow-x-auto select-none text-xs">
      {project.tracks.map(track => (
        <div key={track.id} className="w-24 bg-[#131419] rounded-xl border border-[#2a2d38] p-2.5 flex flex-col justify-between shrink-0">
          {/* Header */}
          <div className="flex flex-col items-center gap-1 border-b border-[#21242e] pb-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: track.color }} />
            <span className="font-bold text-slate-200 text-center text-[10px] truncate w-full">{track.name}</span>
            <span className="text-[8px] text-[#475569] font-mono uppercase">
              {track.effects.filter(e => e.enabled).length} FX
            </span>
          </div>

          {/* Pan */}
          <div className="flex flex-col items-center gap-0.5 my-1.5">
            <span className="text-[8px] font-mono text-[#475569]">
              {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.round(Math.abs(track.pan)*100)}` : `R${Math.round(track.pan*100)}`}
            </span>
            <input type="range" min="-1" max="1" step="0.05" value={track.pan}
              onChange={e => onUpdateTrack(track.id, { pan: parseFloat(e.target.value) })}
              className="w-14 h-1 accent-[#8b5cf6]"
            />
          </div>

          {/* Fader + Meter */}
          <div className="flex-1 flex justify-center items-center gap-2 my-1">
            <div className="w-1.5 h-24 bg-[#0c0d10] rounded-full overflow-hidden flex flex-col justify-end border border-[#21242e]">
              <div
                className="w-full rounded-full transition-all duration-75"
                style={{
                  height: `${track.muted ? 0 : Math.min(100, track.volume * 65)}%`,
                  background: 'linear-gradient(to top, #15803d, #d97706, #d93829)'
                }}
              />
            </div>
            <input type="range" min="0" max="1.5" step="0.01" value={track.volume}
              onChange={e => onUpdateTrack(track.id, { volume: parseFloat(e.target.value) })}
              className="h-24 -rotate-90 w-24 accent-[#d93829]"
            />
          </div>

          <div className="text-center font-mono text-[9px] text-[#475569] mb-1">{Math.round(track.volume * 100)}%</div>

          {/* M/S */}
          <div className="flex gap-1 justify-center">
            <button onClick={() => onUpdateTrack(track.id, { muted: !track.muted })}
              className={`flex-1 py-0.5 rounded text-[9px] font-bold transition ${
                track.muted ? 'bg-[#d97706] text-white' : 'bg-[#21242e] text-[#64748b] hover:text-white'
              }`}>M</button>
            <button onClick={() => onUpdateTrack(track.id, { soloed: !track.soloed })}
              className={`flex-1 py-0.5 rounded text-[9px] font-bold transition ${
                track.soloed ? 'bg-[#0284c7] text-white' : 'bg-[#21242e] text-[#64748b] hover:text-white'
              }`}>S</button>
          </div>
        </div>
      ))}

      {/* Master */}
      <div className="w-28 bg-[#151822] rounded-xl border-2 border-[#d93829]/30 p-2.5 flex flex-col justify-between shrink-0">
        <div className="flex flex-col items-center gap-1 border-b border-[#2a2d38] pb-2">
          <span className="font-extrabold text-[#d93829] text-[11px] tracking-wider">MASTER</span>
          <span className="text-[8px] text-[#475569] font-mono">Stereo Out</span>
        </div>
        <div className="flex-1 flex justify-center items-center gap-2 my-1">
          <div className="w-2 h-28 bg-[#0c0d10] rounded-full overflow-hidden flex flex-col justify-end border border-[#2a2d38]">
            <div className="w-full rounded-full transition-all duration-75"
              style={{
                height: `${Math.min(100, masterPeak * 100)}%`,
                background: masterPeak > 0.85 ? '#d93829' : 'linear-gradient(to top, #15803d, #d97706, #d93829)'
              }}
            />
          </div>
        </div>
        <div className="text-center font-mono text-[10px] text-[#d93829] font-bold mb-1">0.0 dB</div>
      </div>
    </div>
  );
};

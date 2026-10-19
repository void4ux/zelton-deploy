import React from 'react';
import { Volume2, Mic, Music, Disc, Layers, Plus, Trash2, Copy } from 'lucide-react';
import { Track, TrackType } from '../types/daw';

interface TrackListProps {
  tracks: Track[];
  selectedTrackId: string;
  onSelectTrack: (trackId: string) => void;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onOpenAddTrackModal: () => void;
  onDeleteTrack: (trackId: string) => void;
  onDuplicateTrack: (trackId: string) => void;
}

const TRACK_ICONS: Record<TrackType, React.ReactNode> = {
  drum: <Disc className="w-4 h-4" />,
  instrument: <Music className="w-4 h-4" />,
  audio: <Mic className="w-4 h-4" />,
  sampler: <Layers className="w-4 h-4" />,
};

export const TrackList: React.FC<TrackListProps> = ({
  tracks, selectedTrackId, onSelectTrack, onUpdateTrack,
  onOpenAddTrackModal, onDeleteTrack, onDuplicateTrack
}) => {
  return (
    <div className="w-56 bg-[#131419] border-r border-[#2a2d38] flex flex-col shrink-0">
      {/* Header */}
      <div className="h-8 px-3 border-b border-[#2a2d38] flex items-center justify-between bg-[#151822]">
        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Tracks</span>
        <button
          onClick={onOpenAddTrackModal}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#d93829] hover:bg-[#b91c1c] text-white rounded text-[10px] font-bold transition shadow-sm"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Track Rows */}
      <div className="flex-1 overflow-y-auto">
        {tracks.map(track => {
          const selected = track.id === selectedTrackId;

          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={`h-20 px-2.5 py-2 border-b border-[#1e2029] flex flex-col justify-between cursor-pointer transition-colors ${
                selected
                  ? 'bg-[#1a1c23] border-l-[3px]'
                  : 'bg-[#131419] hover:bg-[#16181f]'
              }`}
              style={selected ? { borderLeftColor: track.color } : {}}
            >
              {/* Row 1: Icon + Name + Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span style={{ color: track.color }}>{TRACK_ICONS[track.type]}</span>
                  <span className="text-[11px] font-semibold text-slate-200 truncate">{track.name}</span>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100" style={{ opacity: selected ? 1 : undefined }}>
                  <button onClick={e => { e.stopPropagation(); onDuplicateTrack(track.id); }} className="p-0.5 text-[#64748b] hover:text-white rounded" title="Duplicate">
                    <Copy className="w-3 h-3" />
                  </button>
                  {tracks.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); onDeleteTrack(track.id); }} className="p-0.5 text-[#64748b] hover:text-[#d93829] rounded" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: M S R buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { muted: !track.muted }); }}
                  className={`w-5 h-4 rounded text-[9px] font-bold flex items-center justify-center transition ${
                    track.muted ? 'bg-[#d97706] text-white' : 'bg-[#21242e] text-[#64748b] hover:text-white'
                  }`}
                >M</button>
                <button
                  onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { soloed: !track.soloed }); }}
                  className={`w-5 h-4 rounded text-[9px] font-bold flex items-center justify-center transition ${
                    track.soloed ? 'bg-[#0284c7] text-white' : 'bg-[#21242e] text-[#64748b] hover:text-white'
                  }`}
                >S</button>
                <button
                  onClick={e => { e.stopPropagation(); onUpdateTrack(track.id, { armed: !track.armed }); }}
                  className={`w-5 h-4 rounded text-[9px] font-bold flex items-center justify-center transition ${
                    track.armed ? 'bg-[#d93829] text-white' : 'bg-[#21242e] text-[#64748b] hover:text-white'
                  }`}
                >R</button>
                <div className="flex-1" />
                <span className="text-[9px] font-mono text-[#475569]">{Math.round(track.volume * 100)}%</span>
              </div>

              {/* Row 3: Vol + Pan */}
              <div className="flex items-center gap-1.5">
                <input
                  type="range" min="0" max="1.5" step="0.01"
                  value={track.volume}
                  onClick={e => e.stopPropagation()}
                  onChange={e => onUpdateTrack(track.id, { volume: parseFloat(e.target.value) })}
                  className="flex-1 h-1 accent-[#d93829]"
                />
                <input
                  type="range" min="-1" max="1" step="0.05"
                  value={track.pan}
                  onClick={e => e.stopPropagation()}
                  onChange={e => onUpdateTrack(track.id, { pan: parseFloat(e.target.value) })}
                  className="w-12 h-1 accent-[#6366f1]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

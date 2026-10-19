import React, { useRef } from 'react';
import { FolderOpen, Upload, Music, Disc } from 'lucide-react';
import { Track, Clip } from '../types/daw';
import { audioEngine } from '../audio/AudioEngine';
import { extractWaveformPeaks } from '../audio/wavEncoder';

interface SidebarLibraryProps {
  tracks: Track[];
  selectedTrackId: string;
  onAddClipToTrack: (clip: Clip) => void;
}

const LOOPS = [
  { name: '808 Club Kick Pattern', type: 'drum' as const, beats: 4 },
  { name: 'Future Lead Melody', type: 'instrument' as const, beats: 8 },
  { name: 'Sub 808 Glide Bass', type: 'instrument' as const, beats: 8 },
  { name: 'Ambient Pad Sweep', type: 'instrument' as const, beats: 16 },
  { name: 'Trap Hi-Hat Rolls', type: 'drum' as const, beats: 4 },
  { name: 'Lo-Fi Guitar Riff', type: 'instrument' as const, beats: 8 },
];

export const SidebarLibrary: React.FC<SidebarLibraryProps> = ({ tracks, selectedTrackId, onAddClipToTrack }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const file = files[0];
    const ab = await file.arrayBuffer();
    const ctx = audioEngine.getContext();
    try {
      const buf = await ctx.decodeAudioData(ab);
      const peaks = extractWaveformPeaks(buf, 120);
      const target = tracks.find(t => t.id === selectedTrackId && t.type === 'audio') || tracks.find(t => t.type === 'audio') || tracks[0];
      const durBeats = Math.max(1, Math.round((buf.duration / 60) * 120 * 4) / 4);
      onAddClipToTrack({
        id: `import-${Date.now()}`, trackId: target.id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        startBeat: 0, durationBeats: durBeats, offsetBeat: 0,
        type: 'audio', color: '#d93829', gain: 1, pan: 0,
        audio: { buffer: buf, durationSeconds: buf.duration, sampleRate: buf.sampleRate, channels: buf.numberOfChannels, waveformPeaks: peaks }
      });
    } catch { alert('Could not decode audio file.'); }
    e.target.value = '';
  };

  const insertLoop = (loop: typeof LOOPS[0]) => {
    const target = tracks.find(t => t.type === loop.type) || tracks[0];
    onAddClipToTrack({
      id: `preset-${Date.now()}`, trackId: target.id,
      name: loop.name, startBeat: 0, durationBeats: loop.beats, offsetBeat: 0,
      type: loop.type, color: loop.type === 'drum' ? '#0284c7' : '#6366f1', gain: 1, pan: 0,
      notes: loop.type === 'instrument' ? [
        { id: 'pn1', pitch: 60, startBeat: 0, durationBeats: 2, velocity: 100 },
        { id: 'pn2', pitch: 67, startBeat: 2, durationBeats: 2, velocity: 100 },
        { id: 'pn3', pitch: 65, startBeat: 4, durationBeats: 4, velocity: 100 },
      ] : undefined,
      drumSteps: loop.type === 'drum' ? [
        { pitch: 36, step: 0, velocity: 100, active: true },
        { pitch: 36, step: 8, velocity: 100, active: true },
        { pitch: 38, step: 4, velocity: 100, active: true },
        { pitch: 38, step: 12, velocity: 100, active: true },
        { pitch: 42, step: 2, velocity: 80, active: true },
        { pitch: 42, step: 6, velocity: 80, active: true },
        { pitch: 42, step: 10, velocity: 80, active: true },
        { pitch: 42, step: 14, velocity: 80, active: true }
      ] : undefined
    });
  };

  return (
    <div className="w-52 bg-[#131419] border-l border-[#2a2d38] flex flex-col shrink-0 select-none text-xs">
      <div className="h-8 px-3 border-b border-[#2a2d38] flex items-center gap-1.5 bg-[#151822]">
        <FolderOpen className="w-3.5 h-3.5 text-[#d93829]" />
        <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Library</span>
      </div>

      {/* Import */}
      <div className="p-2.5 border-b border-[#1a1c23]">
        <input type="file" ref={fileRef} onChange={handleUpload} accept="audio/*" className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-2 px-2.5 bg-[#1a1c23] hover:bg-[#21242e] border border-[#2a2d38] hover:border-[#d93829] rounded-xl text-white font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
        ><Upload className="w-3.5 h-3.5 text-[#d93829]" /><span>Import Audio</span></button>
      </div>

      {/* Loops */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
        <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider">Factory Loops</span>
        {LOOPS.map((loop, i) => (
          <div key={i} className="p-2 bg-[#1a1c23] hover:bg-[#21242e] rounded-lg border border-[#21242e] flex flex-col gap-0.5 transition group">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 truncate text-[10px]">{loop.name}</span>
              <button onClick={() => insertLoop(loop)}
                className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 bg-[#d93829] text-white rounded text-[9px] font-bold transition">+ADD</button>
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#475569]">
              <span className="capitalize">{loop.type}</span>
              <span>{loop.beats}b</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

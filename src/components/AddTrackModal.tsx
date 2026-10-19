import React from 'react';
import { Mic, Music, Disc, Layers, Upload, X } from 'lucide-react';
import { TrackType } from '../types/daw';

interface AddTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: TrackType) => void;
  onImportClick: () => void;
}

export const AddTrackModal: React.FC<AddTrackModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
  onImportClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151822] border border-[#2b3145] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative flex flex-col gap-6 select-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242b3d] pb-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-extrabold text-white">Create New Track</h2>
            <p className="text-xs text-[#94a3b8]">Select an instrument or audio source to start making music</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#202638] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Track Type Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Voice / Mic */}
          <button
            onClick={() => {
              onSelectType('audio');
              onClose();
            }}
            className="p-4 rounded-xl bg-[#1c202e] hover:bg-[#242a3d] border border-[#2b334a] hover:border-[#d93829] transition flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#d93829]/15 text-[#d93829] flex items-center justify-center group-hover:scale-110 transition">
              <Mic className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-white">Voice / Mic</span>
            <span className="text-[10px] text-slate-400">Record with AutoPitch & vocal presets</span>
          </button>

          {/* Virtual Instruments */}
          <button
            onClick={() => {
              onSelectType('instrument');
              onClose();
            }}
            className="p-4 rounded-xl bg-[#1c202e] hover:bg-[#242a3d] border border-[#2b334a] hover:border-[#6366f1] transition flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#6366f1]/15 text-[#6366f1] flex items-center justify-center group-hover:scale-110 transition">
              <Music className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-white">Instruments</span>
            <span className="text-[10px] text-slate-400">Poly synth, 808 bass, piano keys</span>
          </button>

          {/* Drum Machine */}
          <button
            onClick={() => {
              onSelectType('drum');
              onClose();
            }}
            className="p-4 rounded-xl bg-[#1c202e] hover:bg-[#242a3d] border border-[#2b334a] hover:border-[#0284c7] transition flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#0284c7]/15 text-[#0284c7] flex items-center justify-center group-hover:scale-110 transition">
              <Disc className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-white">Drum Machine</span>
            <span className="text-[10px] text-slate-400">16-step grid for 808, 909, & trap</span>
          </button>

          {/* 16-Pad Sampler */}
          <button
            onClick={() => {
              onSelectType('sampler');
              onClose();
            }}
            className="p-4 rounded-xl bg-[#1c202e] hover:bg-[#242a3d] border border-[#2b334a] hover:border-[#f59e0b] transition flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-white">Sampler Pads</span>
            <span className="text-[10px] text-slate-400">16 MPC pads playable with QWERTY</span>
          </button>

          {/* Import Audio */}
          <button
            onClick={() => {
              onClose();
              onImportClick();
            }}
            className="p-4 rounded-xl bg-[#1c202e] hover:bg-[#242a3d] border border-[#2b334a] hover:border-emerald-400 transition flex flex-col items-center text-center gap-2.5 group cursor-pointer sm:col-span-2"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Upload className="w-6 h-6" />
            </div>
            <span className="font-bold text-sm text-white">Import Audio / Stems</span>
            <span className="text-[10px] text-slate-400">Upload local WAV, MP3, or beat stems</span>
          </button>
        </div>
      </div>
    </div>
  );
};

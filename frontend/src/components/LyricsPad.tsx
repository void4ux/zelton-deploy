import React, { useState, useEffect } from 'react';
import { FileText, X, Sparkles, Copy, Check } from 'lucide-react';

interface LyricsPadProps {
  isOpen: boolean;
  onClose: () => void;
  lyrics: string;
  onUpdateLyrics: (text: string) => void;
  projectName: string;
}

export const LyricsPad: React.FC<LyricsPadProps> = ({
  isOpen,
  onClose,
  lyrics,
  onUpdateLyrics,
  projectName
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-80 bg-[#13151f] border-l border-[#272d3e] flex flex-col shrink-0 select-none text-xs z-20 shadow-2xl animate-in slide-in-from-right duration-150">
      {/* Header */}
      <div className="h-10 px-3.5 border-b border-[#252b3d] flex items-center justify-between bg-[#161824]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#d93829]" />
          <span className="font-extrabold text-white text-[12px] tracking-wide">
            Lyrics & Notepad
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 text-[#64748b] hover:text-white rounded transition"
            title="Copy all lyrics"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-[#64748b] hover:text-white rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono">
          <span>Track: {projectName}</span>
          <span>{lyrics.split(/\s+/).filter(Boolean).length} Words</span>
        </div>

        <textarea
          value={lyrics}
          onChange={(e) => onUpdateLyrics(e.target.value)}
          placeholder={`[Chorus]\nWrite your hook here...\n\n[Verse 1]\nLay down your bars...`}
          className="flex-1 w-full bg-[#0d0f17] border border-[#23293a] focus:border-[#d93829] rounded-xl p-3 text-slate-200 text-xs font-sans leading-relaxed outline-none resize-none shadow-inner select-text"
        />

        <div className="p-2.5 rounded-xl bg-[#191d2c] border border-[#262c3e] flex items-center gap-2 text-[10px] text-slate-400">
          <Sparkles className="w-4 h-4 text-[#0284c7] shrink-0" />
          <span>Lyrics autosave with your project file and reload automatically.</span>
        </div>
      </div>
    </div>
  );
};

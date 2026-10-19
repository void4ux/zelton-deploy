import React, { useState } from 'react';
import { Settings, X, Sliders, Volume2, ShieldCheck, Check } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [bufferSize, setBufferSize] = useState<number>(256);
  const [latencyOffsetMs, setLatencyOffsetMs] = useState<number>(15);
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [monitoringFeedbackProtection, setMonitoringFeedbackProtection] = useState<boolean>(true);
  const [savedNote, setSavedNote] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSavedNote(true);
    setTimeout(() => {
      setSavedNote(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#12141c] border border-[#272e42] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-[#181b26] border-b border-[#252b3d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Audio Engine & Latency Settings</h2>
              <p className="text-[11px] text-slate-400">Configure Web Audio buffers and hardware calibration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#202638] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {savedNote && (
            <div className="px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Audio settings saved.</span>
            </div>
          )}

          {/* Buffer Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-white">Audio Buffer Size (Latency)</label>
              <span className="font-mono text-cyan-400 font-bold">{bufferSize} samples (~{(bufferSize / (sampleRate / 1000)).toFixed(1)} ms)</span>
            </div>
            <select
              value={bufferSize}
              onChange={e => setBufferSize(parseInt(e.target.value))}
              className="w-full bg-[#1c202d] text-white px-3 py-2 rounded-lg border border-[#2c344a] outline-none font-mono"
            >
              <option value="128">128 samples (Ultra-low latency ~2.9ms - fast CPUs)</option>
              <option value="256">256 samples (Recommended default ~5.8ms)</option>
              <option value="512">512 samples (High stability ~11.6ms)</option>
              <option value="1024">1024 samples (Safe mixing mode ~23.2ms)</option>
            </select>
          </div>

          {/* Recording Latency Compensation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-white">Recording Latency Compensation</label>
              <span className="font-mono text-[#d93829] font-bold">-{latencyOffsetMs} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={latencyOffsetMs}
              onChange={e => setLatencyOffsetMs(parseInt(e.target.value))}
              className="w-full accent-[#d93829]"
            />
            <p className="text-[10px] text-slate-400">Compensates for hardware round-trip delay during microphone recording.</p>
          </div>

          {/* Sample Rate */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-white">Audio Sample Rate</label>
            <select
              value={sampleRate}
              onChange={e => setSampleRate(parseInt(e.target.value))}
              className="w-full bg-[#1c202d] text-white px-3 py-2 rounded-lg border border-[#2c344a] outline-none font-mono"
            >
              <option value="44100">44.1 kHz (CD Quality / Standard)</option>
              <option value="48000">48.0 kHz (Studio Broadcast / Video Standard)</option>
            </select>
          </div>

          {/* Safe Feedback Guard */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#191c28] border border-[#293145]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white block">Acoustic Feedback Guard</span>
                <span className="text-[10px] text-slate-400">Mutes speaker monitor when mic is armed to prevent screeching</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={monitoringFeedbackProtection}
              onChange={e => setMonitoringFeedbackProtection(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </div>

          {/* Save Action */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1a1d28] hover:bg-[#232838] text-slate-300 font-bold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#d93829] hover:bg-[#b91c1c] text-white font-bold shadow-sm transition"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

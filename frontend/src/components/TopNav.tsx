import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, Square, SkipBack, Circle, Repeat,
  Download, Undo2, Redo2, Music4, ChevronDown,
  Volume2, MousePointer, Scissors, Eraser,
  Sparkles, FileText, Sliders, Check, Settings
} from 'lucide-react';
import { Project, TransportState, ToolMode } from '../types/daw';

interface TopNavProps {
  project: Project;
  transport: TransportState;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onToggleRecord: () => void;
  onToggleLoop: () => void;
  onToggleMetronome: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportWav: () => void;
  onExportStems: () => void;
  onSetTool: (tool: ToolMode) => void;
  onToggleAutomation: () => void;
  onToggleLyrics: () => void;
  onOpenAutoPitch: () => void;
  onOpenAiAssistant?: () => void;
  onOpenAudioSettings?: () => void;
  onExportMidi?: () => void;
  masterPeak: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  project,
  transport,
  onUpdateProject,
  onPlay,
  onPause,
  onStop,
  onRewind,
  onToggleRecord,
  onToggleLoop,
  onToggleMetronome,
  onUndo,
  onRedo,
  onExportWav,
  onExportStems,
  onSetTool,
  onToggleAutomation,
  onToggleLyrics,
  onOpenAutoPitch,
  onOpenAiAssistant,
  onOpenAudioSettings,
  onExportMidi,
  masterPeak
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(project.name);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Tap Tempo calculation
  const tapTimesRef = useRef<number[]>([]);
  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter(t => now - t < 3000);
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        diffs.push(taps[i] - taps[i - 1]);
      }
      const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const bpm = Math.round(60000 / avgDiff);
      if (bpm >= 40 && bpm <= 280) {
        onUpdateProject(p => ({ ...p, bpm }));
      }
    }
  };

  useEffect(() => { setTitle(project.name); }, [project.name]);

  const submitTitle = () => {
    setEditingTitle(false);
    if (title.trim()) onUpdateProject(p => ({ ...p, name: title.trim() }));
  };

  const bar = Math.floor(transport.currentBeat / 4) + 1;
  const beat = Math.floor(transport.currentBeat % 4) + 1;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;
  };

  return (
    <header className="h-12 bg-[#131419] border-b border-[#2a2d38] flex items-center justify-between px-3 shrink-0 z-30 select-none">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 cursor-pointer">
          <div className="w-7 h-7 rounded-md bg-[#d93829] flex items-center justify-center border border-[#b91c1c]">
            <Music4 className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-[13px] tracking-wider text-slate-100">ZELTON</span>
        </div>

        <div className="h-4 w-px bg-[#2a2f3e]" />

        {editingTitle ? (
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={submitTitle}
            onKeyDown={e => e.key === 'Enter' && submitTitle()}
            autoFocus
            className="bg-[#171a23] text-sm font-semibold px-2 py-0.5 rounded border border-[#3b82f6] outline-none text-white w-44"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-sm font-semibold text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-[#1a1e28] transition flex items-center gap-1.5"
          >
            {project.name}
            <ChevronDown className="w-3 h-3 text-[#64748b]" />
          </button>
        )}

        {/* Undo & Redo */}
        <div className="flex items-center gap-0.5 ml-1">
          <button onClick={onUndo} className="p-1 text-[#64748b] hover:text-slate-200 rounded hover:bg-[#1a1e28] transition" title="Undo (Ctrl/Cmd+Z)">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onRedo} className="p-1 text-[#64748b] hover:text-slate-200 rounded hover:bg-[#1a1e28] transition" title="Redo (Ctrl/Cmd+Shift+Z)">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Transport */}
      <div className="flex items-center gap-2">
        {/* Tool Mode selector */}
        <div className="flex items-center bg-[#171a23] rounded-md border border-[#272d3c] p-0.5 gap-0.5 mr-1">
          <button
            onClick={() => onSetTool('select')}
            className={`p-1.5 rounded text-xs transition ${transport.activeTool === 'select' ? 'bg-[#293042] text-white' : 'text-[#8592a6] hover:text-white'}`}
            title="Pointer / Select Tool (V)"
          ><MousePointer className="w-3.5 h-3.5" /></button>
          <button
            onClick={() => onSetTool('slice')}
            className={`p-1.5 rounded text-xs transition ${transport.activeTool === 'slice' ? 'bg-[#293042] text-white' : 'text-[#8592a6] hover:text-white'}`}
            title="Slice / Split Tool (C)"
          ><Scissors className="w-3.5 h-3.5" /></button>
          <button
            onClick={() => onSetTool('erase')}
            className={`p-1.5 rounded text-xs transition ${transport.activeTool === 'erase' ? 'bg-[#293042] text-white' : 'text-[#8592a6] hover:text-white'}`}
            title="Erase Tool (E)"
          ><Eraser className="w-3.5 h-3.5" /></button>
        </div>

        {/* Time / Bar Counter */}
        <div className="bg-[#0e1015] border border-[#272d3c] rounded-md px-3 py-1 font-mono text-[12px] font-bold flex items-center gap-1.5 min-w-[115px] justify-center">
          <span className="text-slate-100">{String(bar).padStart(3, ' ')}</span>
          <span className="text-[#3a4154]">.</span>
          <span className="text-[#d93829]">{beat}</span>
          <span className="text-[#3a4154] mx-1">│</span>
          <span className="text-[#64748b] text-[11px]">{formatTime(transport.currentTimeSeconds)}</span>
        </div>

        {/* Transport Control Buttons */}
        <div className="flex items-center bg-[#171a23] rounded-md border border-[#272d3c] p-0.5 gap-0.5">
          <button onClick={onRewind} className="p-1.5 text-[#8592a6] hover:text-white rounded transition" title="Return to Start">
            <SkipBack className="w-4 h-4" />
          </button>
          <button onClick={onStop} className="p-1.5 text-[#8592a6] hover:text-white rounded transition" title="Stop">
            <Square className="w-3.5 h-3.5" />
          </button>

          {transport.isPlaying ? (
            <button onClick={onPause} className="px-3 py-1.5 bg-[#e2e8f0] text-black font-bold rounded text-xs flex items-center gap-1 transition" title="Pause (Space)">
              <Pause className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button onClick={onPlay} className="px-3 py-1.5 bg-[#d93829] hover:bg-[#b91c1c] text-white font-bold rounded text-xs flex items-center gap-1 transition" title="Play (Space)">
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={onToggleRecord}
            className={`p-1.5 rounded transition ${transport.isRecording ? 'bg-[#d93829] text-white animate-rec-pulse' : 'text-[#d93829] hover:bg-[#d93829]/15'}`}
            title="Record Vocal Take"
          ><Circle className="w-4 h-4 fill-current" /></button>

          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded transition ${transport.loop ? 'bg-[#6366f1]/20 text-[#818cf8] border border-[#6366f1]/30' : 'text-[#64748b] hover:text-white'}`}
            title="Cycle Loop"
          ><Repeat className="w-3.5 h-3.5" /></button>
        </div>

        {/* BPM + Tap + Key Signature */}
        <div className="flex items-center bg-[#1a1c23] rounded-lg border border-[#2a2d38] px-2 py-1 gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-1">
            <span className="text-[#64748b]">BPM</span>
            <input
              type="number"
              min={40} max={280}
              value={project.bpm}
              onChange={e => {
                const v = parseInt(e.target.value) || 120;
                onUpdateProject(p => ({ ...p, bpm: Math.max(40, Math.min(280, v)) }));
              }}
              className="w-10 bg-transparent text-white font-bold outline-none text-right"
            />
            <button
              onClick={handleTapTempo}
              className="px-1 text-[9px] font-bold text-cyan-400 bg-cyan-950/40 rounded hover:bg-cyan-800/40 transition"
              title="Click repeatedly to tap tempo"
            >
              TAP
            </button>
          </div>

          <div className="h-3 w-px bg-[#2a2d38]" />

          <button
            onClick={onOpenAutoPitch}
            className="flex items-center gap-1 text-cyan-300 hover:text-white transition"
            title="Open AutoPitch Modal"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{project.keyRoot} {project.keyScale.toUpperCase()}</span>
          </button>

          <div className="h-3 w-px bg-[#2a2d38]" />

          <button
            onClick={onToggleMetronome}
            className={`px-1 py-0.5 rounded text-[9px] font-bold uppercase transition ${transport.metronome ? 'bg-[#d93829] text-white' : 'text-[#64748b] hover:text-white'}`}
            title="Metronome click"
          >Click</button>
        </div>
      </div>

      {/* Right Navigation & Drawers */}
      <div className="flex items-center gap-2">
        {/* Automation toggle */}
        <button
          onClick={onToggleAutomation}
          className={`p-1.5 rounded-lg border transition ${
            transport.showAutomation
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-[#1a1c23] text-[#64748b] border-[#2a2d38] hover:text-white'
          }`}
          title="Toggle Automation Lanes"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Lyrics Pad toggle */}
        <button
          onClick={onToggleLyrics}
          className={`p-1.5 rounded-lg border transition ${
            transport.showLyrics
              ? 'bg-[#d93829]/20 text-[#d93829] border-[#d93829]/40'
              : 'bg-[#1a1c23] text-[#64748b] border-[#2a2d38] hover:text-white'
          }`}
          title="Open Lyrics & Notepad"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className="px-2.5 py-1 rounded-md border border-[#343b4f] bg-[#1a1e2a] hover:bg-[#232838] text-slate-200 hover:text-white transition flex items-center gap-1.5"
          title="Open AI Music Studio Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[11px] font-bold hidden md:inline">AI ASSIST</span>
        </button>

        {/* Audio Settings Dialog Button */}
        <button
          onClick={onOpenAudioSettings}
          className="p-1.5 rounded-md border border-[#272d3c] bg-[#171a23] text-[#8592a6] hover:text-white transition"
          title="Audio Engine & Hardware Latency Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Master Peak Level Meter */}
        <div className="flex items-center gap-1.5 bg-[#0e1015] px-2 py-1 rounded-md border border-[#272d3c]">
          <Volume2 className="w-3 h-3 text-[#64748b]" />
          <div className="w-14 h-1.5 bg-[#171a23] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.min(100, masterPeak * 100)}%`,
                background: masterPeak > 0.85 ? '#d93829' : masterPeak > 0.6 ? '#d97706' : '#059669'
              }}
            />
          </div>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-1 bg-[#d93829] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-md border border-[#b91c1c] flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-9 w-48 bg-[#181a24] border border-[#2b3145] rounded-xl shadow-2xl py-1 z-50">
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportWav();
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#22283a] flex flex-col gap-0.5"
              >
                <span className="font-bold text-white">Mixdown WAV</span>
                <span className="text-[10px] text-[#64748b]">16-bit 44.1kHz Stereo Master</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportStems();
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#22283a] flex flex-col gap-0.5 border-t border-[#242a3d]"
              >
                <span className="font-bold text-cyan-300">All Track Stems</span>
                <span className="text-[10px] text-[#64748b]">Export each track to separate files</span>
              </button>
              {onExportMidi && (
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportMidi();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-[#22283a] flex flex-col gap-0.5 border-t border-[#242a3d]"
                >
                  <span className="font-bold text-amber-300">Standard MIDI (.mid)</span>
                  <span className="text-[10px] text-[#64748b]">Export MIDI note tracks</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

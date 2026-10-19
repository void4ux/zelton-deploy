import React, { useState, useEffect, useRef } from 'react';
import { InstrumentPresetType, KeyScale, Track } from '../types/daw';
import { audioEngine } from '../audio/AudioEngine';
import { Music, Sliders, Zap, Volume2, Sparkles, Disc } from 'lucide-react';

interface VirtualPianoProps {
  track: Track | null;
  keyRoot?: string;
  keyScale?: KeyScale;
  onUpdateTrackPreset?: (preset: InstrumentPresetType) => void;
  onPlayNote?: (pitch: number) => void;
}

interface PianoKeyDef {
  pitchOffset: number; // 0 to 24 relative to base
  name: string;
  isBlack: boolean;
  qwertyKey?: string;
}

const OCTAVE_KEYS: PianoKeyDef[] = [
  { pitchOffset: 0,  name: 'C',  isBlack: false, qwertyKey: 'A' },
  { pitchOffset: 1,  name: 'C#', isBlack: true,  qwertyKey: 'W' },
  { pitchOffset: 2,  name: 'D',  isBlack: false, qwertyKey: 'S' },
  { pitchOffset: 3,  name: 'D#', isBlack: true,  qwertyKey: 'E' },
  { pitchOffset: 4,  name: 'E',  isBlack: false, qwertyKey: 'D' },
  { pitchOffset: 5,  name: 'F',  isBlack: false, qwertyKey: 'F' },
  { pitchOffset: 6,  name: 'F#', isBlack: true,  qwertyKey: 'T' },
  { pitchOffset: 7,  name: 'G',  isBlack: false, qwertyKey: 'G' },
  { pitchOffset: 8,  name: 'G#', isBlack: true,  qwertyKey: 'Y' },
  { pitchOffset: 9,  name: 'A',  isBlack: false, qwertyKey: 'H' },
  { pitchOffset: 10, name: 'A#', isBlack: true,  qwertyKey: 'U' },
  { pitchOffset: 11, name: 'B',  isBlack: false, qwertyKey: 'J' },

  { pitchOffset: 12, name: 'C',  isBlack: false, qwertyKey: 'K' },
  { pitchOffset: 13, name: 'C#', isBlack: true,  qwertyKey: 'O' },
  { pitchOffset: 14, name: 'D',  isBlack: false, qwertyKey: 'L' },
  { pitchOffset: 15, name: 'D#', isBlack: true,  qwertyKey: 'P' },
  { pitchOffset: 16, name: 'E',  isBlack: false, qwertyKey: ';' },
  { pitchOffset: 17, name: 'F',  isBlack: false, qwertyKey: "'" },
  { pitchOffset: 18, name: 'F#', isBlack: true },
  { pitchOffset: 19, name: 'G',  isBlack: false },
  { pitchOffset: 20, name: 'G#', isBlack: true },
  { pitchOffset: 21, name: 'A',  isBlack: false },
  { pitchOffset: 22, name: 'A#', isBlack: true },
  { pitchOffset: 23, name: 'B',  isBlack: false },
  { pitchOffset: 24, name: 'C',  isBlack: false },
];

const PRESETS: { id: InstrumentPresetType; name: string; tag: string; icon: string }[] = [
  { id: 'grand_piano',   name: 'Acoustic Grand Piano', tag: 'PIANO', icon: '🎹' },
  { id: 'rhodes_keys',   name: 'Classic Rhodes EP', tag: 'KEYS', icon: '⚡' },
  { id: 'vintage_organ', name: 'Vintage B3 Organ', tag: 'ORGAN', icon: '🎼' },
  { id: 'synth_pad',     name: 'Dream Ambient Pad', tag: 'PAD', icon: '☁️' },
  { id: 'synth_brass',   name: '80s Synth Brass', tag: 'BRASS', icon: '🎺' },
  { id: 'synth_lead',    name: 'Neon Analog Lead', tag: 'LEAD', icon: '⚡' },
  { id: 'sub_808',       name: '808 Glide Sub Bass', tag: 'BASS', icon: '🔊' },
  { id: 'pluck',         name: 'Acoustic Pluck', tag: 'PLUCK', icon: '🎸' },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function isPitchInScale(pitch: number, keyRoot = 'C', keyScale: KeyScale = 'major'): boolean {
  if (keyScale === 'chromatic') return true;
  const rootIndex = NOTE_NAMES.indexOf(keyRoot.toUpperCase());
  if (rootIndex === -1) return true;

  const noteInterval = (pitch % 12 - rootIndex + 12) % 12;
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
  const pentatonicIntervals = [0, 2, 4, 7, 9];

  if (keyScale === 'major') return majorIntervals.includes(noteInterval);
  if (keyScale === 'minor') return minorIntervals.includes(noteInterval);
  if (keyScale === 'pentatonic') return pentatonicIntervals.includes(noteInterval);
  return true;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({
  track,
  keyRoot = 'C',
  keyScale = 'major',
  onUpdateTrackPreset,
  onPlayNote
}) => {
  const [octave, setOctave] = useState<number>(0); // -2 to +2
  const [pitchBend, setPitchBend] = useState<number>(0); // -100 to +100
  const [modWheel, setModWheel] = useState<number>(0); // 0 to 100
  const [sustain, setSustain] = useState<boolean>(false);
  const [highlightScale, setHighlightScale] = useState<boolean>(true);
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

  // Arpeggiator state
  const [arpEnabled, setArpEnabled] = useState<boolean>(false);
  const [arpRate, setArpRate] = useState<'1/4' | '1/8' | '1/16'>('1/16');
  const [arpMode, setArpMode] = useState<'up' | 'down' | 'random'>('up');
  const arpTimerRef = useRef<number | null>(null);
  const heldNotesRef = useRef<number[]>([]);

  // Sound parameter controls
  const [attack, setAttack] = useState<number>(15);
  const [release, setRelease] = useState<number>(250);
  const [cutoff, setCutoff] = useState<number>(4200);
  const [reverb, setReverb] = useState<number>(30);

  const basePitch = 48 + octave * 12; // C3 by default
  const activePreset: InstrumentPresetType = track?.instrumentPreset || 'grand_piano';

  const triggerRawNote = (pitch: number) => {
    setActiveNotes(prev => new Set(prev).add(pitch));
    audioEngine.previewNote(pitch, 100, activePreset);
    if (onPlayNote) onPlayNote(pitch);

    if (!sustain) {
      setTimeout(() => {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(pitch);
          return next;
        });
      }, 320);
    }
  };

  const triggerNote = (pitch: number) => {
    if (arpEnabled) {
      if (!heldNotesRef.current.includes(pitch)) {
        heldNotesRef.current.push(pitch);
      }
      return;
    }
    triggerRawNote(pitch);
  };

  const releaseNote = (pitch: number) => {
    if (arpEnabled) {
      heldNotesRef.current = heldNotesRef.current.filter(p => p !== pitch);
      return;
    }
    if (!sustain) {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(pitch);
        return next;
      });
    }
  };

  // Arpeggiator clock tick
  useEffect(() => {
    if (!arpEnabled) {
      if (arpTimerRef.current) clearInterval(arpTimerRef.current);
      return;
    }

    const intervalMs = arpRate === '1/4' ? 500 : arpRate === '1/8' ? 250 : 125;
    let stepIndex = 0;

    arpTimerRef.current = window.setInterval(() => {
      if (heldNotesRef.current.length === 0) return;
      const notes = [...heldNotesRef.current].sort((a, b) => a - b);
      let targetPitch = notes[0];

      if (arpMode === 'up') {
        targetPitch = notes[stepIndex % notes.length];
      } else if (arpMode === 'down') {
        const reversed = [...notes].reverse();
        targetPitch = reversed[stepIndex % reversed.length];
      } else {
        targetPitch = notes[Math.floor(Math.random() * notes.length)];
      }

      triggerRawNote(targetPitch);
      stepIndex++;
    }, intervalMs);

    return () => {
      if (arpTimerRef.current) clearInterval(arpTimerRef.current);
    };
  }, [arpEnabled, arpRate, arpMode, activePreset]);

  // QWERTY Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.repeat) return;

      const key = e.key.toUpperCase();
      if (key === 'Z') {
        setOctave(prev => Math.max(-2, prev - 1));
        return;
      }
      if (key === 'X') {
        setOctave(prev => Math.min(2, prev + 1));
        return;
      }

      const match = OCTAVE_KEYS.find(k => k.qwertyKey && k.qwertyKey.toUpperCase() === key);
      if (match) {
        const pitch = basePitch + match.pitchOffset;
        triggerNote(pitch);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      const match = OCTAVE_KEYS.find(k => k.qwertyKey && k.qwertyKey.toUpperCase() === key);
      if (match) {
        const pitch = basePitch + match.pitchOffset;
        releaseNote(pitch);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [basePitch, sustain, arpEnabled, activePreset]);

  const whiteKeys = OCTAVE_KEYS.filter(k => !k.isBlack);
  const blackKeys = OCTAVE_KEYS.filter(k => k.isBlack);

  return (
    <div className="h-full flex flex-col bg-[#0b0c10] select-none text-xs">
      {/* Top Header Bar: Sound Preset, Octave, Arpeggiator, Scale highlight, Sound Knobs */}
      <div className="h-10 px-3 bg-[#151720] border-b border-[#252a3a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Preset Selector */}
          <div className="flex items-center gap-2 bg-[#1b1e2a] px-2 py-0.5 rounded border border-[#2b3245]">
            <span className="text-sm">
              {PRESETS.find(p => p.id === activePreset)?.icon || '🎹'}
            </span>
            <select
              value={activePreset}
              onChange={e => onUpdateTrackPreset && onUpdateTrackPreset(e.target.value as InstrumentPresetType)}
              className="bg-transparent text-slate-100 font-bold text-xs outline-none cursor-pointer"
            >
              {PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-[#1b1e2a] text-white">
                  {p.name} ({p.tag})
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[#262c3e]" />

          {/* Octave Controls */}
          <div className="flex items-center gap-1 bg-[#181a24] px-1.5 py-0.5 rounded border border-[#272d3e]">
            <button
              onClick={() => setOctave(prev => Math.max(-2, prev - 1))}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:bg-[#252a3b] transition"
              title="Shortcut: Z"
            >
              OCT -
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-100 px-1">
              {octave >= 0 ? `+${octave}` : octave}
            </span>
            <button
              onClick={() => setOctave(prev => Math.min(2, prev + 1))}
              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-300 hover:text-white hover:bg-[#252a3b] transition"
              title="Shortcut: X"
            >
              OCT +
            </button>
          </div>

          {/* Sustain Button */}
          <button
            onClick={() => setSustain(!sustain)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1.5 border ${
              sustain
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#181a24] text-[#64748b] border-[#272d3e] hover:text-white'
            }`}
          >
            <span>SUSTAIN</span>
            <span className={`w-1.5 h-1.5 rounded-full ${sustain ? 'bg-amber-400' : 'bg-slate-600'}`} />
          </button>

          {/* Arpeggiator (ARP) */}
          <div className="flex items-center gap-1 bg-[#181a24] px-1.5 py-0.5 rounded border border-[#272d3e]">
            <button
              onClick={() => setArpEnabled(!arpEnabled)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                arpEnabled ? 'bg-[#0284c7]/20 text-[#38bdf8]' : 'text-[#64748b] hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>ARP</span>
            </button>
            {arpEnabled && (
              <>
                <select
                  value={arpRate}
                  onChange={e => setArpRate(e.target.value as any)}
                  className="bg-transparent text-[#38bdf8] font-mono text-[10px] font-bold outline-none cursor-pointer"
                >
                  <option value="1/4" className="bg-[#181a24]">1/4</option>
                  <option value="1/8" className="bg-[#181a24]">1/8</option>
                  <option value="1/16" className="bg-[#181a24]">1/16</option>
                </select>
                <select
                  value={arpMode}
                  onChange={e => setArpMode(e.target.value as any)}
                  className="bg-transparent text-[#38bdf8] font-mono text-[10px] font-bold outline-none cursor-pointer"
                >
                  <option value="up" className="bg-[#181a24]">UP</option>
                  <option value="down" className="bg-[#181a24]">DN</option>
                  <option value="random" className="bg-[#181a24]">RND</option>
                </select>
              </>
            )}
          </div>

          {/* In-Key Scale Highlight Toggle */}
          <button
            onClick={() => setHighlightScale(!highlightScale)}
            className={`px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border ${
              highlightScale
                ? 'bg-[#6366f1]/20 text-[#818cf8] border-[#6366f1]/40'
                : 'bg-[#181a24] text-[#64748b] border-[#272d3e] hover:text-white'
            }`}
            title={`Highlighting ${keyRoot} ${keyScale}`}
          >
            <Sparkles className="w-3 h-3" />
            <span>IN-KEY</span>
          </button>
        </div>

        {/* 4 Rotary Sound Knobs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-[#64748b] uppercase">ATTACK</span>
            <input
              type="range"
              min="1"
              max="100"
              value={attack}
              onChange={e => setAttack(parseInt(e.target.value))}
              className="w-12 h-1 accent-[#cbd5e1]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-[#64748b] uppercase">RELEASE</span>
            <input
              type="range"
              min="50"
              max="1500"
              value={release}
              onChange={e => setRelease(parseInt(e.target.value))}
              className="w-12 h-1 accent-[#cbd5e1]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-[#64748b] uppercase">CUTOFF</span>
            <input
              type="range"
              min="100"
              max="8000"
              value={cutoff}
              onChange={e => setCutoff(parseInt(e.target.value))}
              className="w-12 h-1 accent-[#0284c7]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-[#64748b] uppercase">REVERB</span>
            <input
              type="range"
              min="0"
              max="100"
              value={reverb}
              onChange={e => setReverb(parseInt(e.target.value))}
              className="w-12 h-1 accent-[#6366f1]"
            />
          </div>
        </div>
      </div>

      {/* Main Keyboard Body & Wheels with Acoustic Red Felt Trim */}
      <div className="flex-1 flex p-2.5 gap-2.5 overflow-hidden bg-[#07080b]">
        {/* Left Wheels Strip */}
        <div className="w-20 bg-[#141720] rounded-lg border border-[#252a38] p-2 flex justify-around items-center shrink-0">
          {/* Pitch Bend Wheel */}
          <div className="flex flex-col items-center justify-between h-full py-1">
            <span className="text-[8px] font-mono font-bold text-[#64748b]">PITCH</span>
            <div className="relative flex-1 flex items-center justify-center py-1">
              <input
                type="range"
                min="-100"
                max="100"
                value={pitchBend}
                onChange={e => setPitchBend(parseInt(e.target.value))}
                onMouseUp={() => setPitchBend(0)}
                onTouchEnd={() => setPitchBend(0)}
                className="h-24 -rotate-90 w-24 accent-[#d93829] cursor-pointer"
              />
            </div>
            <span className="text-[7px] font-mono text-slate-400">BEND</span>
          </div>

          {/* Mod Wheel */}
          <div className="flex flex-col items-center justify-between h-full py-1">
            <span className="text-[8px] font-mono font-bold text-[#64748b]">MOD</span>
            <div className="relative flex-1 flex items-center justify-center py-1">
              <input
                type="range"
                min="0"
                max="100"
                value={modWheel}
                onChange={e => setModWheel(parseInt(e.target.value))}
                className="h-24 -rotate-90 w-24 accent-[#0284c7] cursor-pointer"
              />
            </div>
            <span className="text-[7px] font-mono text-slate-400">WHEEL</span>
          </div>
        </div>

        {/* 3D Ivory Piano Keyboard Frame */}
        <div className="flex-1 bg-[#12151e] rounded-lg border border-[#252a38] p-1.5 flex flex-col relative overflow-hidden">
          {/* Acoustic Burgundy Felt Strip above keys */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#7f1d1d] rounded-t-sm shrink-0 z-30 mb-0.5 border-b border-black/60" />

          {/* Piano Keys Interactive Area */}
          <div className="flex-1 relative flex overflow-hidden">
            {/* White Keys Row */}
            <div className="flex-1 flex h-full gap-0.5 relative z-0">
              {whiteKeys.map((k, index) => {
                const pitch = basePitch + k.pitchOffset;
                const isPressed = activeNotes.has(pitch);
                const inScale = isPitchInScale(pitch, keyRoot, keyScale);
                const octaveNum = Math.floor(pitch / 12) - 1;

                return (
                  <button
                    key={index}
                    onMouseDown={() => triggerNote(pitch)}
                    onMouseUp={() => releaseNote(pitch)}
                    onMouseLeave={() => releaseNote(pitch)}
                    className={`flex-1 rounded-b flex flex-col justify-between items-center pb-2 pt-1 transition-all duration-75 relative select-none border-x border-[#cbd5e1]/40 ${
                      isPressed
                        ? 'bg-[#e2e8f0] shadow-inner translate-y-1'
                        : 'bg-[#ffffff] hover:bg-[#f8fafc] shadow-sm'
                    }`}
                    style={{
                      borderBottomWidth: isPressed ? '2px' : '4px',
                      borderBottomColor: isPressed ? '#94a3b8' : '#cbd5e1'
                    }}
                  >
                    {/* Top QWERTY shortcut or In-Key indicator */}
                    <div className="flex flex-col items-center gap-0.5">
                      {k.qwertyKey ? (
                        <span className="text-[9px] font-mono font-bold text-[#64748b] bg-black/5 px-1 rounded">
                          {k.qwertyKey}
                        </span>
                      ) : <div className="h-3" />}

                      {/* In-Key subtle dot */}
                      {highlightScale && inScale && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                      )}
                    </div>

                    {/* Bottom Note Name */}
                    <span className={`text-[10px] font-mono font-bold ${inScale ? 'text-black' : 'text-slate-400'}`}>
                      {k.name}{octaveNum}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Black Keys Layer (Absolute Positioning) */}
            <div className="absolute inset-0 pointer-events-none z-10 flex">
              {whiteKeys.map((wKey, index) => {
                const nextPitch = wKey.pitchOffset + 1;
                const bKey = blackKeys.find(b => b.pitchOffset === nextPitch);

                if (!bKey || index === whiteKeys.length - 1) {
                  return <div key={index} className="flex-1" />;
                }

                const pitch = basePitch + bKey.pitchOffset;
                const isPressed = activeNotes.has(pitch);
                const inScale = isPitchInScale(pitch, keyRoot, keyScale);

                return (
                  <div key={index} className="flex-1 relative">
                    <button
                      onMouseDown={() => triggerNote(pitch)}
                      onMouseUp={() => releaseNote(pitch)}
                      onMouseLeave={() => releaseNote(pitch)}
                      className={`absolute right-[-24%] top-0 w-[48%] h-[60%] rounded-b border border-black flex flex-col justify-between items-center pb-1.5 pt-1 pointer-events-auto transition-all duration-75 z-20 ${
                        isPressed
                          ? 'bg-[#242836] shadow-inner translate-y-0.5'
                          : 'bg-gradient-to-b from-[#242834] via-[#1a1c24] to-[#0f1015] hover:brightness-110 shadow-md'
                      }`}
                      style={{
                        borderBottomWidth: isPressed ? '2px' : '4px',
                        borderBottomColor: isPressed ? '#475569' : '#000000'
                      }}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        {bKey.qwertyKey && (
                          <span className="text-[8px] font-mono font-bold text-slate-300">
                            {bKey.qwertyKey}
                          </span>
                        )}
                        {highlightScale && inScale && (
                          <div className="w-1 h-1 rounded-full bg-[#38bdf8]" />
                        )}
                      </div>
                      <span className="text-[7px] font-mono font-bold text-slate-400">
                        {bKey.name}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

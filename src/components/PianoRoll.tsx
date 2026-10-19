import React, { useState, useEffect } from 'react';
import { MidiNote, Clip, KeyScale } from '../types/daw';
import { audioEngine } from '../audio/AudioEngine';
import { getScaleMidiNotes } from '../audio/vocalPresets';
import { Grid, Volume2, Wand2, Keyboard } from 'lucide-react';

interface PianoRollProps {
  clip: Clip | null;
  bpm: number;
  keyRoot: string;
  keyScale: KeyScale;
  onUpdateClipNotes: (notes: MidiNote[]) => void;
}

const PITCHES = (() => {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const rows: { pitch: number; name: string; isBlack: boolean }[] = [];
  for (let p = 84; p >= 36; p--) {
    const n = names[p % 12];
    const oct = Math.floor(p / 12) - 1;
    rows.push({ pitch: p, name: `${n}${oct}`, isBlack: n.includes('#') });
  }
  return rows;
})();

const QWERTY_PITCH_MAP: Record<string, number> = {
  'A': 60, // C4
  'W': 61, // C#4
  'S': 62, // D4
  'E': 63, // D#4
  'D': 64, // E4
  'F': 65, // F4
  'T': 66, // F#4
  'G': 67, // G4
  'Y': 68, // G#4
  'H': 69, // A4
  'U': 70, // A#4
  'J': 71, // B4
  'K': 72, // C5
  'O': 73, // C#5
  'L': 74, // D5
};

export const PianoRoll: React.FC<PianoRollProps> = ({
  clip,
  bpm,
  keyRoot,
  keyScale,
  onUpdateClipNotes
}) => {
  const [snap, setSnap] = useState(0.25);
  const [dur, setDur] = useState(1);
  const [vel, setVel] = useState(100);
  const [octaveShift, setOctaveShift] = useState(0); // -2 to +2
  const [highlightScale, setHighlightScale] = useState(true);

  const inScaleNotes = React.useMemo(() => {
    return getScaleMidiNotes(keyRoot, keyScale);
  }, [keyRoot, keyScale]);

  // QWERTY keyboard live note playing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toUpperCase();
      if (key === 'Z') {
        setOctaveShift(prev => Math.max(-2, prev - 1));
      } else if (key === 'X') {
        setOctaveShift(prev => Math.min(2, prev + 1));
      } else if (QWERTY_PITCH_MAP[key] !== undefined) {
        const pitch = QWERTY_PITCH_MAP[key] + (octaveShift * 12);
        audioEngine.previewNote(pitch, vel);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [octaveShift, vel]);

  if (!clip || clip.type !== 'instrument') {
    return (
      <div className="h-full flex items-center justify-center text-[#475569] text-xs">
        Select a MIDI instrument clip on the arrangement timeline to edit in the Piano Roll.
      </div>
    );
  }

  const notes = clip.notes || [];
  const dBeats = clip.durationBeats || 16;
  const pxBeat = 48;
  const totalW = dBeats * pxBeat;

  const handleCell = (pitch: number, beat: number) => {
    const existing = notes.find(n => n.pitch === pitch && Math.abs(n.startBeat - beat) < snap / 2);
    if (existing) {
      onUpdateClipNotes(notes.filter(n => n.id !== existing.id));
    } else {
      const nn: MidiNote = {
        id: `note-${Date.now()}-${Math.random()}`,
        pitch,
        startBeat: beat,
        durationBeats: dur,
        velocity: vel
      };
      onUpdateClipNotes([...notes, nn]);
      audioEngine.previewNote(pitch, vel);
    }
  };

  const quantizeNotes = (grid: number) => {
    const quantized = notes.map(n => ({
      ...n,
      startBeat: Math.round(n.startBeat / grid) * grid,
      durationBeats: Math.max(grid, Math.round(n.durationBeats / grid) * grid)
    }));
    onUpdateClipNotes(quantized);
  };

  return (
    <div className="h-full flex flex-col bg-[#0c0d10] select-none text-xs">
      {/* Toolbar */}
      <div className="h-8 px-3 border-b border-[#2a2d38] flex items-center justify-between bg-[#131419]">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-[#8b5cf6] text-[11px] truncate max-w-xs">
            Piano Roll: {clip.name}
          </span>

          <div className="flex items-center gap-1 text-[#94a3b8]">
            <Grid className="w-3 h-3 text-[#8b5cf6]" />
            <select
              value={snap}
              onChange={e => setSnap(parseFloat(e.target.value))}
              className="text-[10px]"
            >
              <option value="1">1/4 Beat</option>
              <option value="0.5">1/8</option>
              <option value="0.25">1/16</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-[#94a3b8]">
            <span className="text-[10px]">Len:</span>
            <select
              value={dur}
              onChange={e => setDur(parseFloat(e.target.value))}
              className="text-[10px]"
            >
              <option value="0.25">1/16</option>
              <option value="0.5">1/8</option>
              <option value="1">1 Beat</option>
              <option value="2">2 Beats</option>
              <option value="4">1 Bar</option>
            </select>
          </div>

          <button
            onClick={() => quantizeNotes(snap)}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1f2334] hover:bg-[#2c334b] text-cyan-300 rounded text-[10px] font-semibold transition"
            title="Snap all notes to current grid"
          >
            <Wand2 className="w-3 h-3" />
            <span>Quantize</span>
          </button>

          <button
            onClick={() => setHighlightScale(!highlightScale)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
              highlightScale
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                : 'text-[#64748b] hover:text-white'
            }`}
          >
            Scale: {keyRoot} {keyScale}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* QWERTY indicator */}
          <div className="flex items-center gap-1 bg-[#1a1c23] px-2 py-0.5 rounded text-[10px] font-mono text-[#94a3b8] border border-[#262a39]">
            <Keyboard className="w-3 h-3 text-[#d93829]" />
            <span>Keys [A-L]</span>
            <span className="text-[#d93829] font-bold">Octave {octaveShift >= 0 ? `+${octaveShift}` : octaveShift}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Volume2 className="w-3 h-3 text-[#8b5cf6]" />
            <span className="text-[10px]">Vel {vel}</span>
            <input
              type="range"
              min="1"
              max="127"
              value={vel}
              onChange={e => setVel(parseInt(e.target.value))}
              className="w-20 h-1 accent-[#8b5cf6]"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Piano keys */}
        <div className="w-20 bg-[#131419] border-r border-[#2a2d38] overflow-y-auto shrink-0 flex flex-col">
          {PITCHES.map(p => {
            const inScale = inScaleNotes.has(p.pitch);

            return (
              <button
                key={p.pitch}
                onClick={() => audioEngine.previewNote(p.pitch, vel)}
                className={`h-5 border-b border-[#1a1c23] flex items-center justify-between px-1.5 text-[9px] font-mono transition ${
                  p.isBlack
                    ? 'bg-[#0c0d10] text-[#94a3b8] hover:bg-[#151822]'
                    : inScale && highlightScale
                    ? 'bg-[#222332] text-white hover:bg-[#2c2f42]'
                    : 'bg-[#1a1c23] text-[#94a3b8] hover:bg-[#21242e]'
                }`}
              >
                <span className="font-semibold">{p.name}</span>
                {inScale && highlightScale && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Note matrix */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#0c0d10]">
          <div style={{ width: `${totalW}px` }} className="relative flex flex-col">
            {PITCHES.map(p => {
              const inScale = inScaleNotes.has(p.pitch);

              return (
                <div
                  key={p.pitch}
                  className={`h-5 border-b border-[#15171e] flex relative ${
                    p.isBlack
                      ? 'bg-[#090a0e]'
                      : inScale && highlightScale
                      ? 'bg-[#12131d]'
                      : 'bg-[#0e1015]'
                  }`}
                >
                  {Array.from({ length: Math.ceil(dBeats / snap) }).map((_, i) => {
                    const beat = i * snap;
                    const isBar = beat % 4 === 0;
                    const isBeat = beat % 1 === 0;

                    return (
                      <div
                        key={i}
                        onClick={() => handleCell(p.pitch, beat)}
                        style={{ width: `${snap * pxBeat}px` }}
                        className={`h-full border-r cursor-crosshair hover:bg-[#8b5cf6]/15 transition ${
                          isBar
                            ? 'border-r-[#2a2d38]'
                            : isBeat
                            ? 'border-r-[#1a1c23]'
                            : 'border-r-[#131419]'
                        }`}
                      />
                    );
                  })}

                  {notes
                    .filter(n => n.pitch === p.pitch)
                    .map(note => (
                      <div
                        key={note.id}
                        onClick={e => {
                          e.stopPropagation();
                          audioEngine.previewNote(note.pitch, note.velocity);
                        }}
                        style={{
                          left: `${note.startBeat * pxBeat}px`,
                          width: `${Math.max(10, note.durationBeats * pxBeat)}px`
                        }}
                        className="absolute top-0.5 bottom-0.5 rounded-sm bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] border border-[#a78bfa] text-white font-mono text-[8px] px-1 flex items-center justify-between shadow-md z-10 group"
                      >
                        <span className="truncate">{p.name}</span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onUpdateClipNotes(notes.filter(n => n.id !== note.id));
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] hover:text-[#d93829]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

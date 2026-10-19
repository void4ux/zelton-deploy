import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Grid, Sliders, Volume2 } from 'lucide-react';
import { Project, Clip, ToolMode, AutomationPoint } from '../types/daw';

interface ArrangementTimelineProps {
  project: Project;
  currentBeat: number;
  selectedClipId: string | null;
  activeTool: ToolMode;
  showAutomation: boolean;
  onSelectClip: (clipId: string | null) => void;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onSplitClip: (clipId: string, atBeat: number) => void;
  onSeek: (beat: number) => void;
  onUpdateProject: (updater: (prev: Project) => Project) => void;
}

export const ArrangementTimeline: React.FC<ArrangementTimelineProps> = ({
  project,
  currentBeat,
  selectedClipId,
  activeTool,
  showAutomation,
  onSelectClip,
  onUpdateClip,
  onDeleteClip,
  onDuplicateClip,
  onSplitClip,
  onSeek,
  onUpdateProject
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pxPerBeat, setPxPerBeat] = useState(40);
  const [snap, setSnap] = useState<number>(1);

  const [dragClipId, setDragClipId] = useState<string | null>(null);
  const [dragAction, setDragAction] = useState<'move' | 'trim-l' | 'trim-r' | 'fade-in' | 'fade-out' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragInitStart, setDragInitStart] = useState(0);
  const [dragInitDur, setDragInitDur] = useState(0);

  const snapBeat = (b: number) => (snap > 0 ? Math.round(b / snap) * snap : b);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    onSeek(snapBeat(Math.max(0, x / pxPerBeat)));
  };

  // Drag logic
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragClipId || !dragAction) return;
      const dx = e.clientX - dragStartX;
      const dBeats = dx / pxPerBeat;

      if (dragAction === 'move') {
        onUpdateClip(dragClipId, { startBeat: Math.max(0, snapBeat(dragInitStart + dBeats)) });
      } else if (dragAction === 'trim-r') {
        onUpdateClip(dragClipId, { durationBeats: Math.max(snap || 0.25, snapBeat(dragInitDur + dBeats)) });
      } else if (dragAction === 'trim-l') {
        const rawStart = dragInitStart + dBeats;
        const snapped = Math.max(0, snapBeat(rawStart));
        const diff = snapped - dragInitStart;
        const newDur = dragInitDur - diff;
        if (newDur >= (snap || 0.25)) {
          onUpdateClip(dragClipId, { startBeat: snapped, durationBeats: newDur });
        }
      }
    };
    const onUp = () => {
      setDragClipId(null);
      setDragAction(null);
    };
    if (dragClipId) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragClipId, dragAction, dragStartX, dragInitStart, dragInitDur, pxPerBeat, snap]);

  // Keyboard actions
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedClipId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Backspace' || e.key === 'Delete') onDeleteClip(selectedClipId);
      else if (e.key === 'd' || e.key === 'D') onDuplicateClip(selectedClipId);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedClipId, currentBeat]);

  const totalBeats = Math.max(64, Math.ceil(currentBeat / 16) * 16 + 16);
  const timelineW = totalBeats * pxPerBeat;
  const trackH = showAutomation ? 120 : 80;

  const handleClipClick = (e: React.MouseEvent, clip: Clip) => {
    e.stopPropagation();
    if (activeTool === 'erase') {
      onDeleteClip(clip.id);
    } else if (activeTool === 'slice') {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + containerRef.current.scrollLeft;
      const atBeat = snapBeat(x / pxPerBeat);
      if (atBeat > clip.startBeat && atBeat < clip.startBeat + clip.durationBeats) {
        onSplitClip(clip.id, atBeat);
      }
    } else {
      onSelectClip(clip.id);
    }
  };

  const addAutomationPoint = (trackId: string, beat: number, val: number) => {
    onUpdateProject(prev => ({
      ...prev,
      tracks: prev.tracks.map(t => {
        if (t.id === trackId) {
          const autoLane = t.automation[0] || { id: `auto-${Date.now()}`, param: 'volume', enabled: true, points: [] };
          const newPt: AutomationPoint = { id: `pt-${Date.now()}`, beat, value: Math.max(0, Math.min(1, val)) };
          const updatedPoints = [...autoLane.points.filter(p => Math.abs(p.beat - beat) > 0.5), newPt].sort((a,b) => a.beat - b.beat);
          return { ...t, automation: [{ ...autoLane, points: updatedPoints }] };
        }
        return t;
      })
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c0d10] overflow-hidden select-none relative">
      {/* Timeline sub-header */}
      <div className="h-8 px-3 border-b border-[#2a2d38] flex items-center justify-between bg-[#131419] text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Grid className="w-3 h-3 text-[#d93829]" />
            <span className="text-[10px] font-semibold">Snap:</span>
            <select
              value={snap}
              onChange={e => setSnap(parseFloat(e.target.value))}
              className="text-[10px]"
            >
              <option value="4">1 Bar</option>
              <option value="2">1/2 Bar</option>
              <option value="1">1/4 Beat</option>
              <option value="0.5">1/8</option>
              <option value="0.25">1/16</option>
              <option value="0.125">1/32</option>
              <option value="0">Off (Free)</option>
            </select>
          </div>

          {showAutomation && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Sliders className="w-3 h-3" />
              <span>Click automation lane to add volume points</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-[#64748b]">
          <button
            onClick={() => setPxPerBeat(Math.max(15, pxPerBeat - 10))}
            className="p-0.5 hover:text-white rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[9px] font-mono w-7 text-center">{pxPerBeat}px</span>
          <button
            onClick={() => setPxPerBeat(Math.min(160, pxPerBeat + 10))}
            className="p-0.5 hover:text-white rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Arrangement Canvas */}
      <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-auto relative">
        <div style={{ width: `${timelineW}px` }} className="relative min-h-full">
          {/* Time Ruler */}
          <div
            onClick={handleRulerClick}
            className="h-6 bg-[#151822] border-b border-[#2a2d38] sticky top-0 z-10 cursor-pointer relative"
          >
            {/* Loop Cycle Region */}
            {project.loopEnabled && (
              <div
                className="absolute top-0 bottom-0 bg-[#d93829]/20 border-x-2 border-[#d93829] pointer-events-none"
                style={{
                  left: `${project.loopStartBeat * pxPerBeat}px`,
                  width: `${(project.loopEndBeat - project.loopStartBeat) * pxPerBeat}px`
                }}
              >
                <div className="text-[8px] font-mono font-bold text-white bg-[#d93829] px-1 py-0.5 w-fit rounded-br">
                  LOOP
                </div>
              </div>
            )}

            {Array.from({ length: Math.ceil(totalBeats / 4) }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-[#2a2d38] pl-1.5 pt-0.5 text-[9px] font-mono text-[#64748b]"
                style={{ left: `${i * 4 * pxPerBeat}px` }}
              >
                <span className="font-bold text-[#94a3b8]">{i + 1}</span>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 top-6 pointer-events-none">
            {Array.from({ length: totalBeats }).map((_, i) => (
              <div
                key={i}
                className={`absolute top-0 bottom-0 ${
                  i % 4 === 0 ? 'border-l border-[#21242e]' : 'border-l border-[#15171e]'
                }`}
                style={{ left: `${i * pxPerBeat}px` }}
              />
            ))}
          </div>

          {/* Track Lanes */}
          <div className="relative">
            {project.tracks.map(track => {
              const trackClips = project.clips.filter(c => c.trackId === track.id);
              const autoPoints = track.automation[0]?.points || [];

              return (
                <div
                  key={track.id}
                  className="border-b border-[#1a1c23] relative bg-[#0f1118]/40"
                  style={{ height: `${trackH}px` }}
                  onClick={() => onSelectClip(null)}
                >
                  {/* Clips */}
                  {trackClips.map(clip => {
                    const isSel = clip.id === selectedClipId;
                    const left = clip.startBeat * pxPerBeat;
                    const width = clip.durationBeats * pxPerBeat;

                    return (
                      <div
                        key={clip.id}
                        onClick={e => handleClipClick(e, clip)}
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          top: '4px',
                          height: '70px',
                          backgroundColor: `${clip.color}20`,
                          borderColor: isSel ? '#ffffff' : `${clip.color}88`
                        }}
                        className={`absolute rounded-lg border-[1.5px] flex flex-col overflow-hidden transition-shadow cursor-pointer group ${
                          isSel ? 'ring-1 ring-white/60 shadow-lg shadow-black/80' : ''
                        }`}
                      >
                        {/* Clip header */}
                        <div
                          onMouseDown={e => {
                            if (activeTool !== 'select') return;
                            e.stopPropagation();
                            onSelectClip(clip.id);
                            setDragClipId(clip.id);
                            setDragAction('move');
                            setDragStartX(e.clientX);
                            setDragInitStart(clip.startBeat);
                            setDragInitDur(clip.durationBeats);
                          }}
                          className="h-[18px] px-1.5 flex items-center justify-between text-[9px] font-bold text-white/90 cursor-grab active:cursor-grabbing border-b border-white/10"
                          style={{ backgroundColor: `${clip.color}55` }}
                        >
                          <span className="truncate">{clip.name}</span>
                          <span className="text-[8px] font-mono opacity-60">{clip.durationBeats}b</span>
                        </div>

                        {/* Clip Waveform / Notes */}
                        <div className="flex-1 relative flex items-center px-0.5 overflow-hidden pointer-events-none">
                          {clip.type === 'audio' && clip.audio?.waveformPeaks && (
                            <svg className="w-full h-full" preserveAspectRatio="none">
                              {clip.audio.waveformPeaks.map((pk, idx) => {
                                const x = (idx / clip.audio!.waveformPeaks!.length) * 100;
                                const h = Math.max(3, pk * 95);
                                return (
                                  <line
                                    key={idx}
                                    x1={`${x}%`}
                                    y1={`${50 - h / 2}%`}
                                    x2={`${x}%`}
                                    y2={`${50 + h / 2}%`}
                                    stroke={clip.color}
                                    strokeWidth="1.5"
                                  />
                                );
                              })}
                            </svg>
                          )}

                          {clip.type === 'instrument' && clip.notes && (
                            <div className="w-full h-full relative">
                              {clip.notes.map(n => {
                                const nL = (n.startBeat / clip.durationBeats) * 100;
                                const nW = (n.durationBeats / clip.durationBeats) * 100;
                                const pNorm = ((n.pitch - 36) / 48) * 100;
                                return (
                                  <div
                                    key={n.id}
                                    className="absolute h-[3px] rounded-full"
                                    style={{
                                      left: `${nL}%`,
                                      width: `${Math.max(2, nW)}%`,
                                      bottom: `${Math.min(85, Math.max(10, pNorm))}%`,
                                      backgroundColor: clip.color
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}

                          {clip.type === 'drum' && clip.drumSteps && (
                            <div className="w-full h-full flex items-end justify-around px-1 gap-px">
                              {clip.drumSteps.filter(s => s.active).map((s, i) => (
                                <div
                                  key={i}
                                  className="w-[2px] rounded-full"
                                  style={{
                                    height: `${Math.max(15, (s.velocity / 127) * 80)}%`,
                                    backgroundColor: clip.color
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Edge Trim handles */}
                        {activeTool === 'select' && (
                          <>
                            <div
                              onMouseDown={e => {
                                e.stopPropagation();
                                setDragClipId(clip.id);
                                setDragAction('trim-l');
                                setDragStartX(e.clientX);
                                setDragInitStart(clip.startBeat);
                                setDragInitDur(clip.durationBeats);
                              }}
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-white/40 transition"
                            />
                            <div
                              onMouseDown={e => {
                                e.stopPropagation();
                                setDragClipId(clip.id);
                                setDragAction('trim-r');
                                setDragStartX(e.clientX);
                                setDragInitStart(clip.startBeat);
                                setDragInitDur(clip.durationBeats);
                              }}
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white/40 transition"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}

                  {/* Automation Lane Overlay */}
                  {showAutomation && (
                    <div
                      onClick={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const beat = Math.max(0, x / pxPerBeat);
                        const val = 1 - (y / 40); // 0 to 1
                        addAutomationPoint(track.id, snapBeat(beat), val);
                      }}
                      className="absolute bottom-1 left-0 right-0 h-10 border-t border-dashed border-[#f59e0b]/40 bg-[#f59e0b]/5 cursor-crosshair"
                    >
                      {/* Automation points and lines */}
                      <svg className="w-full h-full pointer-events-none">
                        {autoPoints.map((pt, idx) => {
                          const px = pt.beat * pxPerBeat;
                          const py = (1 - pt.value) * 36 + 2;
                          const nextPt = autoPoints[idx + 1];

                          return (
                            <React.Fragment key={pt.id}>
                              {nextPt && (
                                <line
                                  x1={px}
                                  y1={py}
                                  x2={nextPt.beat * pxPerBeat}
                                  y2={(1 - nextPt.value) * 36 + 2}
                                  stroke="#f59e0b"
                                  strokeWidth="2"
                                />
                              )}
                              <circle
                                cx={px}
                                cy={py}
                                r="4"
                                fill="#f59e0b"
                                stroke="#ffffff"
                                strokeWidth="1.5"
                              />
                            </React.Fragment>
                          );
                        })}
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-[#d93829] z-20 pointer-events-none transition-[left] duration-75"
            style={{ left: `${currentBeat * pxPerBeat}px` }}
          >
            <div className="w-3 h-3 bg-[#d93829] -ml-[5px] rotate-45 rounded-sm shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

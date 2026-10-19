export type TrackType = 'audio' | 'instrument' | 'drum' | 'sampler';

export type KeyScale = 'major' | 'minor' | 'chromatic' | 'pentatonic';

export type ToolMode = 'select' | 'slice' | 'erase';

export type TimeDisplayMode = 'bars' | 'time';

export type VocalPresetType =
  | 'none'
  | 'autopitch'
  | 'modern_rap'
  | 'clean_air'
  | 'warm_vintage'
  | 'space_echo'
  | 'hyperpop'
  | 'vinyl_radio'
  | 'heavy_chorus'
  | 'drill_vocal'
  | 'lofi_telephone';

export type DrumKitType = '808_trap' | '909_techno' | 'boombap' | 'lofi_chill' | 'acoustic';

export type InstrumentPresetType =
  | 'grand_piano'
  | 'rhodes_keys'
  | 'vintage_organ'
  | 'synth_lead'
  | 'sub_808'
  | 'pluck'
  | 'synth_pad'
  | 'synth_brass';

export interface MidiNote {
  id: string;
  pitch: number; // 0 - 127 (e.g. 60 = C4)
  startBeat: number; // in beats
  durationBeats: number;
  velocity: number; // 0 - 127
}

export interface DrumStep {
  pitch: number;
  step: number; // 0 - 15 (or 0 - 31 for 2 banks)
  velocity: number; // 0 - 127
  active: boolean;
}

export interface SamplerPad {
  id: number;
  name: string;
  keyLabel: string;
  pitch: number;
  color: string;
}

export interface AudioClipData {
  buffer?: AudioBuffer;
  blobUrl?: string;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  waveformPeaks?: number[];
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  startBeat: number;
  durationBeats: number;
  offsetBeat: number;
  type: TrackType;
  color: string;

  // Specific payloads
  audio?: AudioClipData;
  notes?: MidiNote[];
  drumSteps?: DrumStep[];

  // Processing & editing
  gain: number;
  pan: number;
  reversed?: boolean;
  fadeInBeats?: number;
  fadeOutBeats?: number;
}

export interface AutomationPoint {
  id: string;
  beat: number;
  value: number; // 0 to 1
}

export interface AutomationLane {
  id: string;
  param: 'volume' | 'pan' | 'filterCutoff';
  points: AutomationPoint[];
  enabled: boolean;
}

export interface EffectConfig {
  id: string;
  type: 'eq3' | 'compressor' | 'delay' | 'reverb' | 'distortion' | 'filter' | 'limiter' | 'autopitch';
  enabled: boolean;
  params: Record<string, number>;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  volume: number; // 0 to 1.5
  pan: number; // -1 to 1
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  monitoring: boolean;
  vocalPreset?: VocalPresetType;
  drumKit?: DrumKitType;
  instrumentPreset?: InstrumentPresetType;
  effects: EffectConfig[];
  automation: AutomationLane[];
}

export interface Project {
  id: string;
  name: string;
  version: number;
  bpm: number;
  keyRoot: string; // 'C', 'C#', 'D'...
  keyScale: KeyScale;
  timeSignature: [number, number]; // [4, 4]
  tracks: Track[];
  clips: Clip[];
  loopEnabled: boolean;
  loopStartBeat: number;
  loopEndBeat: number;
  lyrics?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  currentBeat: number;
  currentTimeSeconds: number;
  bpm: number;
  metronome: boolean;
  metronomeSound: 'click' | 'woodblock' | 'beep' | 'hihat';
  countIn: 0 | 1 | 2; // bars
  loop: boolean;
  loopStartBeat: number;
  loopEndBeat: number;
  displayMode: TimeDisplayMode;
  activeTool: ToolMode;
  showAutomation: boolean;
  showLyrics: boolean;
  showAutoPitchModal: boolean;
}

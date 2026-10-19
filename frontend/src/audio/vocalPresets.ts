import { EffectConfig, VocalPresetType, KeyScale } from '../types/daw';

export interface VocalPresetDefinition {
  id: VocalPresetType;
  name: string;
  description: string;
  badge: string;
  color: string;
  effects: EffectConfig[];
}

export const VOCAL_PRESETS: VocalPresetDefinition[] = [
  {
    id: 'none',
    name: 'Clean Voice',
    description: 'Dry direct studio vocal signal with no coloration',
    badge: 'RAW',
    color: '#94a3b8',
    effects: []
  },
  {
    id: 'autopitch',
    name: 'AutoPitch Robot',
    description: 'Instant quantized pitch correction with resonant peak tracking',
    badge: 'AUTOPITCH',
    color: '#0284c7',
    effects: [
      {
        id: 'fx-ap-1',
        type: 'autopitch',
        enabled: true,
        params: { speed: 100, depth: 100 }
      },
      {
        id: 'fx-ap-eq',
        type: 'eq3',
        enabled: true,
        params: { low: -4, mid: 2, high: 5 }
      },
      {
        id: 'fx-ap-comp',
        type: 'compressor',
        enabled: true,
        params: { threshold: -18, ratio: 8, attack: 4, release: 120, knee: 10 }
      }
    ]
  },
  {
    id: 'modern_rap',
    name: 'Modern Rap',
    description: 'Punchy optical compression, high-shelf air, and snappy 1/16 slap delay',
    badge: 'POPULAR',
    color: '#d93829',
    effects: [
      {
        id: 'fx-mr-comp',
        type: 'compressor',
        enabled: true,
        params: { threshold: -22, ratio: 10, attack: 3, release: 90, knee: 12 }
      },
      {
        id: 'fx-mr-eq',
        type: 'eq3',
        enabled: true,
        params: { low: -4, mid: 1, high: 6 }
      },
      {
        id: 'fx-mr-delay',
        type: 'delay',
        enabled: true,
        params: { time: 0.12, feedback: 0.22, wet: 25 }
      },
      {
        id: 'fx-mr-rev',
        type: 'reverb',
        enabled: true,
        params: { decay: 1.4, wet: 18 }
      }
    ]
  },
  {
    id: 'clean_air',
    name: 'Clean Air Vocal',
    description: 'Velvet top-end clarity, low-end de-mud, and transparent leveling',
    badge: 'STUDIO',
    color: '#38bdf8',
    effects: [
      {
        id: 'fx-ca-eq',
        type: 'eq3',
        enabled: true,
        params: { low: -5, mid: 0, high: 7 }
      },
      {
        id: 'fx-ca-comp',
        type: 'compressor',
        enabled: true,
        params: { threshold: -16, ratio: 3.5, attack: 15, release: 200, knee: 20 }
      },
      {
        id: 'fx-ca-rev',
        type: 'reverb',
        enabled: true,
        params: { decay: 1.8, wet: 22 }
      }
    ]
  },
  {
    id: 'warm_vintage',
    name: 'Warm Studio Tube',
    description: 'Analog tube saturation warmth, body EQ bump, and smooth plate ambience',
    badge: 'ANALOG',
    color: '#f59e0b',
    effects: [
      {
        id: 'fx-wv-dist',
        type: 'distortion',
        enabled: true,
        params: { drive: 16, wet: 35 }
      },
      {
        id: 'fx-wv-eq',
        type: 'eq3',
        enabled: true,
        params: { low: 2.5, mid: 3, high: 1 }
      },
      {
        id: 'fx-wv-rev',
        type: 'reverb',
        enabled: true,
        params: { decay: 2.4, wet: 30 }
      }
    ]
  },
  {
    id: 'space_echo',
    name: 'Space Verb & Echo',
    description: 'Huge atmospheric dimension with long tail shimmer and tempo echo',
    badge: 'AMBIENT',
    color: '#8b5cf6',
    effects: [
      {
        id: 'fx-se-delay',
        type: 'delay',
        enabled: true,
        params: { time: 0.35, feedback: 0.45, wet: 45 }
      },
      {
        id: 'fx-se-rev',
        type: 'reverb',
        enabled: true,
        params: { decay: 4.2, wet: 55 }
      }
    ]
  },
  {
    id: 'hyperpop',
    name: 'Hyperpop Grit',
    description: 'Radio telephone filtering, clipped overdrive, and extreme fast limiting',
    badge: 'TRENDING',
    color: '#ec4899',
    effects: [
      {
        id: 'fx-hp-filter',
        type: 'filter',
        enabled: true,
        params: { cutoff: 2100, resonance: 4, mode: 2 }
      },
      {
        id: 'fx-hp-dist',
        type: 'distortion',
        enabled: true,
        params: { drive: 60, wet: 75 }
      },
      {
        id: 'fx-hp-comp',
        type: 'compressor',
        enabled: true,
        params: { threshold: -30, ratio: 18, attack: 1.5, release: 60, knee: 4 }
      }
    ]
  },
  {
    id: 'vinyl_radio',
    name: '70s Vinyl Radio',
    description: 'Narrow bandwidth telephone megaphone effect with subtle warmth',
    badge: 'LO-FI',
    color: '#d97706',
    effects: [
      {
        id: 'fx-vr-filter',
        type: 'filter',
        enabled: true,
        params: { cutoff: 1600, resonance: 5, mode: 2 }
      },
      {
        id: 'fx-vr-dist',
        type: 'distortion',
        enabled: true,
        params: { drive: 22, wet: 40 }
      }
    ]
  },
  {
    id: 'heavy_chorus',
    name: 'Wide Double Vocal',
    description: 'Stereo doubling chorus spread for lush backing vocals and harmonies',
    badge: 'STEREO',
    color: '#10b981',
    effects: [
      {
        id: 'fx-hc-delay',
        type: 'delay',
        enabled: true,
        params: { time: 0.035, feedback: 0.25, wet: 50 }
      },
      {
        id: 'fx-hc-rev',
        type: 'reverb',
        enabled: true,
        params: { decay: 2.0, wet: 28 }
      }
    ]
  },
  {
    id: 'drill_vocal',
    name: 'UK/NY Drill Lead',
    description: 'Extreme aggressive limiting, scooped lower-mids, and dark room ambience',
    badge: 'DRILL',
    color: '#06b6d4',
    effects: [
      {
        id: 'fx-dv-comp',
        type: 'compressor',
        enabled: true,
        params: { threshold: -26, ratio: 12, attack: 2, release: 80, knee: 8 }
      },
      {
        id: 'fx-dv-eq',
        type: 'eq3',
        enabled: true,
        params: { low: -6, mid: -2, high: 6 }
      },
      {
        id: 'fx-dv-delay',
        type: 'delay',
        enabled: true,
        params: { time: 0.18, feedback: 0.3, wet: 28 }
      }
    ]
  },
  {
    id: 'lofi_telephone',
    name: 'Lo-Fi Telephone',
    description: 'Classic vintage speaker filter cut, muted high-end, and tape saturation',
    badge: 'VINTAGE',
    color: '#64748b',
    effects: [
      {
        id: 'fx-lt-filter',
        type: 'filter',
        enabled: true,
        params: { cutoff: 1400, resonance: 3, mode: 2 }
      },
      {
        id: 'fx-lt-dist',
        type: 'distortion',
        enabled: true,
        params: { drive: 30, wet: 50 }
      }
    ]
  }
];

export function getVocalPreset(id: VocalPresetType): VocalPresetDefinition {
  return VOCAL_PRESETS.find(p => p.id === id) || VOCAL_PRESETS[0];
}

const CHROMATIC_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_STEPS = [0, 2, 3, 5, 7, 8, 10];
const PENTATONIC_STEPS = [0, 2, 4, 7, 9];

const ROOT_OFFSETS: Record<string, number> = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
};

export function getScaleMidiNotes(root: string, scale: KeyScale): Set<number> {
  const rootOffset = ROOT_OFFSETS[root] ?? 0;
  let steps = CHROMATIC_STEPS;
  if (scale === 'major') steps = MAJOR_STEPS;
  else if (scale === 'minor') steps = MINOR_STEPS;
  else if (scale === 'pentatonic') steps = PENTATONIC_STEPS;

  const validNotes = new Set<number>();
  for (let octave = 0; octave <= 9; octave++) {
    for (const step of steps) {
      const midi = (octave * 12) + ((rootOffset + step) % 12);
      if (midi <= 127) validNotes.add(midi);
    }
  }
  return validNotes;
}

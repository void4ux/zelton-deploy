import { Project, Track, Clip, DrumStep, MidiNote } from '../types/daw';
import { getVocalPreset } from '../audio/vocalPresets';

export function createDefaultProject(): Project {
  // 16-step default beat
  const drumSteps: DrumStep[] = [
    // Kick (36)
    { pitch: 36, step: 0, velocity: 110, active: true },
    { pitch: 36, step: 6, velocity: 90, active: true },
    { pitch: 36, step: 8, velocity: 110, active: true },
    { pitch: 36, step: 14, velocity: 95, active: true },
    // Snare (38)
    { pitch: 38, step: 4, velocity: 105, active: true },
    { pitch: 38, step: 12, velocity: 110, active: true },
    // Clap (39)
    { pitch: 39, step: 12, velocity: 90, active: true },
    // Closed Hat (42)
    { pitch: 42, step: 0, velocity: 80, active: true },
    { pitch: 42, step: 2, velocity: 70, active: true },
    { pitch: 42, step: 4, velocity: 85, active: true },
    { pitch: 42, step: 6, velocity: 75, active: true },
    { pitch: 42, step: 8, velocity: 90, active: true },
    { pitch: 42, step: 10, velocity: 70, active: true },
    { pitch: 42, step: 12, velocity: 85, active: true },
    { pitch: 42, step: 14, velocity: 80, active: true },
    // Open Hat (46)
    { pitch: 46, step: 14, velocity: 75, active: true },
  ];

  // Melodic Lead Notes (C Minor: C4, Eb4, F4, G4)
  const synthNotes: MidiNote[] = [
    { id: 'n1', pitch: 60, startBeat: 0, durationBeats: 0.75, velocity: 95 }, // C4
    { id: 'n2', pitch: 63, startBeat: 1, durationBeats: 0.75, velocity: 100 }, // Eb4
    { id: 'n3', pitch: 65, startBeat: 2, durationBeats: 1.5, velocity: 105 }, // F4
    { id: 'n4', pitch: 67, startBeat: 4, durationBeats: 0.75, velocity: 100 }, // G4
    { id: 'n5', pitch: 65, startBeat: 5, durationBeats: 0.75, velocity: 95 }, // F4
    { id: 'n6', pitch: 63, startBeat: 6, durationBeats: 1.75, velocity: 90 }, // Eb4
    { id: 'n7', pitch: 60, startBeat: 8, durationBeats: 3.5, velocity: 85 }, // C4
  ];

  // Bass Notes (C2, Eb2, F2, C2)
  const bassNotes: MidiNote[] = [
    { id: 'b1', pitch: 36, startBeat: 0, durationBeats: 3.5, velocity: 110 },
    { id: 'b2', pitch: 39, startBeat: 4, durationBeats: 3.5, velocity: 110 },
    { id: 'b3', pitch: 41, startBeat: 8, durationBeats: 3.5, velocity: 110 },
    { id: 'b4', pitch: 36, startBeat: 12, durationBeats: 3.5, velocity: 110 },
  ];

  // Acoustic Grand Piano Chords (Cm - Ab - Fm - G)
  const pianoNotes: MidiNote[] = [
    { id: 'p1', pitch: 60, startBeat: 0, durationBeats: 3.5, velocity: 92 },
    { id: 'p2', pitch: 63, startBeat: 0, durationBeats: 3.5, velocity: 86 },
    { id: 'p3', pitch: 67, startBeat: 0, durationBeats: 3.5, velocity: 90 },

    { id: 'p4', pitch: 56, startBeat: 4, durationBeats: 3.5, velocity: 90 },
    { id: 'p5', pitch: 60, startBeat: 4, durationBeats: 3.5, velocity: 85 },
    { id: 'p6', pitch: 63, startBeat: 4, durationBeats: 3.5, velocity: 88 },

    { id: 'p7', pitch: 53, startBeat: 8, durationBeats: 3.5, velocity: 90 },
    { id: 'p8', pitch: 56, startBeat: 8, durationBeats: 3.5, velocity: 85 },
    { id: 'p9', pitch: 60, startBeat: 8, durationBeats: 3.5, velocity: 88 },

    { id: 'p10', pitch: 55, startBeat: 12, durationBeats: 3.5, velocity: 95 },
    { id: 'p11', pitch: 59, startBeat: 12, durationBeats: 3.5, velocity: 90 },
    { id: 'p12', pitch: 62, startBeat: 12, durationBeats: 3.5, velocity: 92 },
  ];

  const tracks: Track[] = [
    {
      id: 't-drums',
      name: '808 Drum Machine',
      type: 'drum',
      color: '#0284c7', // BandLab Cyan
      volume: 0.95,
      pan: 0,
      muted: false,
      soloed: false,
      armed: false,
      monitoring: false,
      effects: [
        {
          id: 'fx-comp',
          type: 'compressor',
          enabled: true,
          params: { threshold: -16, ratio: 4, attack: 15, release: 150, knee: 10 }
        }
      ],
      automation: []
    },
    {
      id: 't-piano',
      name: 'Concert Grand Piano',
      type: 'instrument',
      color: '#f59e0b', // Amber / Gold
      volume: 0.9,
      pan: 0,
      muted: false,
      soloed: false,
      armed: false,
      monitoring: false,
      instrumentPreset: 'grand_piano',
      effects: [
        {
          id: 'fx-reverb-piano',
          type: 'reverb',
          enabled: true,
          params: { decay: 2.2, wet: 28 }
        }
      ],
      automation: []
    },
    {
      id: 't-synth',
      name: 'Neon Synth Lead',
      type: 'instrument',
      color: '#6366f1', // Violet
      volume: 0.85,
      pan: -0.15,
      muted: false,
      soloed: false,
      armed: false,
      monitoring: false,
      instrumentPreset: 'synth_lead',
      effects: [
        {
          id: 'fx-delay',
          type: 'delay',
          enabled: true,
          params: { time: 0.35, feedback: 0.3, wet: 35 }
        },
        {
          id: 'fx-reverb',
          type: 'reverb',
          enabled: true,
          params: { decay: 2.5, wet: 25 }
        }
      ],
      automation: []
    },
    {
      id: 't-bass',
      name: '808 Sub Bass',
      type: 'instrument',
      color: '#059669', // Emerald
      volume: 0.9,
      pan: 0,
      muted: false,
      soloed: false,
      armed: false,
      monitoring: false,
      instrumentPreset: 'sub_808',
      effects: [
        {
          id: 'fx-filter',
          type: 'filter',
          enabled: true,
          params: { cutoff: 800, resonance: 4, mode: 0 }
        }
      ],
      automation: []
    },
    {
      id: 't-vocal',
      name: 'Lead Vocal (AutoPitch)',
      type: 'audio',
      color: '#d93829', // BandLab Signature Coral Red
      volume: 1.0,
      pan: 0,
      muted: false,
      soloed: false,
      armed: true,
      monitoring: true,
      vocalPreset: 'autopitch',
      effects: getVocalPreset('autopitch').effects,
      automation: []
    }
  ];

  const clips: Clip[] = [
    {
      id: 'c-drum-1',
      trackId: 't-drums',
      name: 'Club 808 Loop A',
      startBeat: 0,
      durationBeats: 4,
      offsetBeat: 0,
      type: 'drum',
      color: '#0284c7',
      gain: 1,
      pan: 0,
      drumSteps: [...drumSteps]
    },
    {
      id: 'c-drum-2',
      trackId: 't-drums',
      name: 'Club 808 Loop B',
      startBeat: 4,
      durationBeats: 4,
      offsetBeat: 0,
      type: 'drum',
      color: '#0284c7',
      gain: 1,
      pan: 0,
      drumSteps: [...drumSteps]
    },
    {
      id: 'c-drum-3',
      trackId: 't-drums',
      name: 'Club 808 Loop C',
      startBeat: 8,
      durationBeats: 4,
      offsetBeat: 0,
      type: 'drum',
      color: '#0284c7',
      gain: 1,
      pan: 0,
      drumSteps: [...drumSteps]
    },
    {
      id: 'c-drum-4',
      trackId: 't-drums',
      name: 'Club 808 Loop D',
      startBeat: 12,
      durationBeats: 4,
      offsetBeat: 0,
      type: 'drum',
      color: '#0284c7',
      gain: 1,
      pan: 0,
      drumSteps: [...drumSteps]
    },
    {
      id: 'c-piano-1',
      trackId: 't-piano',
      name: 'Grand Piano Chords',
      startBeat: 0,
      durationBeats: 16,
      offsetBeat: 0,
      type: 'instrument',
      color: '#f59e0b',
      gain: 1,
      pan: 0,
      notes: [...pianoNotes]
    },
    {
      id: 'c-synth-1',
      trackId: 't-synth',
      name: 'Main Lead Hook',
      startBeat: 0,
      durationBeats: 16,
      offsetBeat: 0,
      type: 'instrument',
      color: '#6366f1',
      gain: 1,
      pan: 0,
      notes: [...synthNotes]
    },
    {
      id: 'c-bass-1',
      trackId: 't-bass',
      name: 'Deep Bassline',
      startBeat: 0,
      durationBeats: 16,
      offsetBeat: 0,
      type: 'instrument',
      color: '#059669',
      gain: 1,
      pan: 0,
      notes: [...bassNotes]
    }
  ];

  return {
    id: `proj-${Date.now()}`,
    name: 'New ZELTON Track',
    version: 1,
    bpm: 128,
    keyRoot: 'C',
    keyScale: 'minor',
    timeSignature: [4, 4],
    tracks,
    clips,
    loopEnabled: true,
    loopStartBeat: 0,
    loopEndBeat: 16,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

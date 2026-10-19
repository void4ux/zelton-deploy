import { MidiNote, DrumStep, Track, Clip, Project, EffectConfig } from '../types/daw';

export interface ChordSuggestion {
  name: string;
  genre: string;
  progression: string[];
  notes: { root: number; intervals: number[] }[];
}

export const CHORD_PRESETS: Record<string, ChordSuggestion[]> = {
  pop: [
    {
      name: 'Emotional Pop (I - V - vi - IV)',
      genre: 'Pop / Ballad',
      progression: ['C', 'G', 'Am', 'F'],
      notes: [
        { root: 60, intervals: [0, 4, 7] }, // C
        { root: 55, intervals: [0, 4, 7] }, // G
        { root: 57, intervals: [0, 3, 7] }, // Am
        { root: 53, intervals: [0, 4, 7] }, // F
      ]
    },
    {
      name: 'Euphoric Dance Pop (vi - IV - I - V)',
      genre: 'Dance Pop',
      progression: ['Am', 'F', 'C', 'G'],
      notes: [
        { root: 57, intervals: [0, 3, 7] }, // Am
        { root: 53, intervals: [0, 4, 7] }, // F
        { root: 60, intervals: [0, 4, 7] }, // C
        { root: 55, intervals: [0, 4, 7] }, // G
      ]
    }
  ],
  trap: [
    {
      name: 'Dark Trap Melancholy (i - VI - III - VII)',
      genre: 'Trap / Hip-Hop',
      progression: ['Cm', 'Ab', 'Eb', 'Bb'],
      notes: [
        { root: 60, intervals: [0, 3, 7] }, // Cm
        { root: 56, intervals: [0, 4, 7] }, // Ab
        { root: 63, intervals: [0, 4, 7] }, // Eb
        { root: 58, intervals: [0, 4, 7] }, // Bb
      ]
    },
    {
      name: 'Hypnotic Drill (i - iv - v - i)',
      genre: 'UK / NY Drill',
      progression: ['Dm', 'Gm', 'Am', 'Dm'],
      notes: [
        { root: 62, intervals: [0, 3, 7] }, // Dm
        { root: 55, intervals: [0, 3, 7] }, // Gm
        { root: 57, intervals: [0, 3, 7] }, // Am
        { root: 62, intervals: [0, 3, 7] }, // Dm
      ]
    }
  ],
  rnb: [
    {
      name: 'Neo-Soul Jazzy 7ths (ii9 - V13 - Imaj9)',
      genre: 'Neo Soul / R&B',
      progression: ['Dm9', 'G13', 'Cmaj9', 'Am9'],
      notes: [
        { root: 62, intervals: [0, 3, 7, 10, 14] }, // Dm9
        { root: 55, intervals: [0, 4, 7, 10, 21] }, // G13
        { root: 60, intervals: [0, 4, 7, 11, 14] }, // Cmaj9
        { root: 57, intervals: [0, 3, 7, 10, 14] }, // Am9
      ]
    }
  ],
  lofi: [
    {
      name: 'Chill Coffeehouse Nostalgia (Imaj7 - vi7 - ii7 - V7)',
      genre: 'Lo-Fi Hip Hop',
      progression: ['Cmaj7', 'Am7', 'Dm7', 'G7'],
      notes: [
        { root: 60, intervals: [0, 4, 7, 11] }, // Cmaj7
        { root: 57, intervals: [0, 3, 7, 10] }, // Am7
        { root: 62, intervals: [0, 3, 7, 10] }, // Dm7
        { root: 55, intervals: [0, 4, 7, 10] }, // G7
      ]
    }
  ]
};

export class AiAssistantEngine {
  /**
   * Generates 4-bar MIDI chord clip notes from progression preset
   */
  public static generateChordNotes(preset: ChordSuggestion): MidiNote[] {
    const notes: MidiNote[] = [];
    const beatsPerChord = 4;

    preset.notes.forEach((chord, chordIdx) => {
      const startBeat = chordIdx * beatsPerChord;
      chord.intervals.forEach((interval, intIdx) => {
        const pitch = chord.root + interval;
        notes.push({
          id: `ai-n-${Date.now()}-${chordIdx}-${intIdx}`,
          pitch,
          startBeat,
          durationBeats: 3.8,
          velocity: Math.floor(85 + Math.random() * 15)
        });
      });
    });

    return notes;
  }

  /**
   * Generates a complementary 4-bar bassline matching a chord progression
   */
  public static generateBassline(preset: ChordSuggestion): MidiNote[] {
    const bassNotes: MidiNote[] = [];
    const beatsPerChord = 4;

    preset.notes.forEach((chord, chordIdx) => {
      const rootPitch = (chord.root % 12) + 36; // C2 range
      const startBeat = chordIdx * beatsPerChord;

      // Syncopated rhythmic bass groove (1, 2.5, 3.5 beats)
      bassNotes.push({
        id: `ai-b1-${chordIdx}`,
        pitch: rootPitch,
        startBeat: startBeat,
        durationBeats: 1.25,
        velocity: 105
      });
      bassNotes.push({
        id: `ai-b2-${chordIdx}`,
        pitch: rootPitch,
        startBeat: startBeat + 1.5,
        durationBeats: 0.75,
        velocity: 95
      });
      bassNotes.push({
        id: `ai-b3-${chordIdx}`,
        pitch: rootPitch + 7, // 5th octave jump
        startBeat: startBeat + 2.5,
        durationBeats: 1.0,
        velocity: 100
      });
    });

    return bassNotes;
  }

  /**
   * Generates a genre-specific 16-step drum pattern
   */
  public static generateDrumPattern(genre: 'trap' | 'boombap' | 'house' | 'drill'): DrumStep[] {
    const steps: DrumStep[] = [];

    if (genre === 'trap') {
      // 808 Trap: Hard kick, clap on 4 & 12, rolling hi-hats
      [0, 6, 8, 14].forEach(s => steps.push({ pitch: 36, step: s, velocity: 115, active: true })); // Kick
      [4, 12].forEach(s => steps.push({ pitch: 39, step: s, velocity: 110, active: true })); // Clap
      // Rolling hats (every step with velocity accent)
      for (let s = 0; s < 16; s++) {
        steps.push({ pitch: 42, step: s, velocity: s % 2 === 0 ? 90 : 70, active: true });
      }
      // Open hat on 14
      steps.push({ pitch: 46, step: 14, velocity: 85, active: true });
    } else if (genre === 'house') {
      // 4-on-the-floor
      [0, 4, 8, 12].forEach(s => steps.push({ pitch: 36, step: s, velocity: 115, active: true }));
      [4, 12].forEach(s => steps.push({ pitch: 38, step: s, velocity: 105, active: true }));
      [2, 6, 10, 14].forEach(s => steps.push({ pitch: 46, step: s, velocity: 95, active: true })); // Offbeat hats
    } else if (genre === 'boombap') {
      // Classic 90s Boom Bap
      [0, 5, 8, 11].forEach(s => steps.push({ pitch: 36, step: s, velocity: 110, active: true }));
      [4, 12].forEach(s => steps.push({ pitch: 38, step: s, velocity: 115, active: true }));
      [0, 2, 4, 6, 8, 10, 12, 14].forEach(s => steps.push({ pitch: 42, step: s, velocity: 80, active: true }));
    } else {
      // Drill bounce
      [0, 6, 10].forEach(s => steps.push({ pitch: 36, step: s, velocity: 120, active: true }));
      [6, 14].forEach(s => steps.push({ pitch: 39, step: s, velocity: 105, active: true }));
      // Triplets feel hats
      [0, 2, 3, 5, 8, 10, 11, 13, 15].forEach(s => steps.push({ pitch: 42, step: s, velocity: 85, active: true }));
    }

    return steps;
  }
}

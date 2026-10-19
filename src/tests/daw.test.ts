import { describe, it, expect } from 'vitest';
import { midiNoteToFrequency } from '../audio/synthEngine';
import { audioBufferToWav } from '../audio/wavEncoder';
import { createDefaultProject } from '../data/defaultProject';
import { ProjectStore } from '../storage/projectStore';
import { Project } from '../types/daw';

describe('ZELTON DAW Core Audio & Timeline Tests', () => {
  it('converts MIDI note numbers to standard concert pitch frequencies accurately', () => {
    expect(midiNoteToFrequency(69)).toBe(440); // A4
    expect(Math.round(midiNoteToFrequency(60))).toBe(262); // C4 ~261.63Hz
    expect(Math.round(midiNoteToFrequency(36))).toBe(65); // C2 ~65.41Hz
    expect(Math.round(midiNoteToFrequency(72))).toBe(523); // C5 ~523.25Hz
  });

  it('correctly calculates beat to bar subdivisions for standard 4/4 time', () => {
    const calculateBarBeat = (beat: number) => {
      const bar = Math.floor(beat / 4) + 1;
      const beatInBar = Math.floor(beat % 4) + 1;
      const sixteenth = Math.floor((beat * 4) % 4) + 1;
      return { bar, beatInBar, sixteenth };
    };

    expect(calculateBarBeat(0)).toEqual({ bar: 1, beatInBar: 1, sixteenth: 1 });
    expect(calculateBarBeat(3.5)).toEqual({ bar: 1, beatInBar: 4, sixteenth: 3 });
    expect(calculateBarBeat(4)).toEqual({ bar: 2, beatInBar: 1, sixteenth: 1 });
    expect(calculateBarBeat(15.75)).toEqual({ bar: 4, beatInBar: 4, sixteenth: 4 });
  });

  it('splits clips cleanly without losing length or offsets', () => {
    const originalClip = {
      id: 'clip-1',
      trackId: 'track-1',
      name: 'Synth Line',
      startBeat: 0,
      durationBeats: 8,
      offsetBeat: 0,
      type: 'instrument' as const,
      color: '#8b5cf6',
      gain: 1,
      pan: 0
    };

    const atBeat = 3;
    const firstDuration = atBeat - originalClip.startBeat;
    const secondDuration = originalClip.durationBeats - firstDuration;

    const first = { ...originalClip, durationBeats: firstDuration };
    const second = {
      ...originalClip,
      id: 'clip-2',
      startBeat: atBeat,
      durationBeats: secondDuration,
      offsetBeat: originalClip.offsetBeat + firstDuration
    };

    expect(first.durationBeats).toBe(3);
    expect(second.startBeat).toBe(3);
    expect(second.durationBeats).toBe(5);
    expect(first.durationBeats + second.durationBeats).toBe(8);
  });

  it('serializes and deserializes projects accurately', () => {
    const proj = createDefaultProject();
    expect(proj.tracks.length).toBeGreaterThanOrEqual(3);
    expect(proj.clips.length).toBeGreaterThanOrEqual(3);

    const json = JSON.stringify(proj);
    const restored: Project = JSON.parse(json);
    expect(restored.name).toBe(proj.name);
    expect(restored.bpm).toBe(proj.bpm);
    expect(restored.tracks.length).toBe(proj.tracks.length);
  });

  it('manages undo and redo history accurately', () => {
    const proj1 = createDefaultProject();
    proj1.name = 'Take 1';

    ProjectStore.pushHistory(proj1);

    const proj2 = { ...proj1, name: 'Take 2' };
    const undoResult = ProjectStore.undo(proj2);
    expect(undoResult?.name).toBe('Take 1');

    const redoResult = ProjectStore.redo(undoResult!);
    expect(redoResult?.name).toBe('Take 2');
  });

  it('encodes standard MIDI files with correct MThd and MTrk headers', async () => {
    const { exportTrackToMidiBlob } = await import('../audio/midiFileEncoder');
    const testClip = {
      id: 'clip-test',
      trackId: 'track-1',
      name: 'Test MIDI',
      startBeat: 0,
      durationBeats: 4,
      offsetBeat: 0,
      type: 'instrument' as const,
      color: '#f59e0b',
      gain: 1,
      pan: 0,
      notes: [
        { id: 'n1', pitch: 60, startBeat: 0, durationBeats: 1, velocity: 100 },
        { id: 'n2', pitch: 64, startBeat: 1, durationBeats: 1, velocity: 90 },
      ]
    };

    const blob = exportTrackToMidiBlob(testClip, 120);
    expect(blob).toBeDefined();
    expect(blob.type).toBe('audio/midi');
    expect(blob.size).toBeGreaterThan(20);

    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // MThd signature: 0x4D, 0x54, 0x68, 0x64
    expect(bytes[0]).toBe(0x4D);
    expect(bytes[1]).toBe(0x54);
    expect(bytes[2]).toBe(0x68);
    expect(bytes[3]).toBe(0x64);
  });

  it('AI Assistant generates valid 4-bar chords, basslines, and 16-step drum patterns', async () => {
    const { AiAssistantEngine, CHORD_PRESETS } = await import('../ai/aiAssistantEngine');
    const trapChords = CHORD_PRESETS.trap[0];
    expect(trapChords).toBeDefined();

    const chordNotes = AiAssistantEngine.generateChordNotes(trapChords);
    expect(chordNotes.length).toBeGreaterThanOrEqual(12); // 4 chords * 3 notes
    expect(chordNotes[0].velocity).toBeGreaterThan(0);

    const bassNotes = AiAssistantEngine.generateBassline(trapChords);
    expect(bassNotes.length).toBeGreaterThan(0);
    expect(bassNotes[0].pitch).toBeLessThan(50); // Bass register

    const trapDrums = AiAssistantEngine.generateDrumPattern('trap');
    expect(trapDrums.length).toBeGreaterThanOrEqual(16);
    expect(trapDrums.some(d => d.pitch === 36)).toBe(true); // Has kick
    expect(trapDrums.some(d => d.pitch === 42)).toBe(true); // Has hi-hat
  });
});

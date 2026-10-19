import { Project, MidiNote, Clip } from '../types/daw';

/**
 * Standard MIDI File (.mid) binary encoder.
 * Writes a valid Format 1 Standard MIDI File with Tempo and Note On/Note Off events.
 */
export function exportTrackToMidiBlob(clip: Clip, bpm: number = 120): Blob {
  const notes = clip.notes || [];
  const ticksPerBeat = 480;

  // Convert MidiNotes into delta-time MIDI events
  interface MidiRawEvent {
    tick: number;
    type: 'noteOn' | 'noteOff';
    pitch: number;
    velocity: number;
  }

  const rawEvents: MidiRawEvent[] = [];

  for (const n of notes) {
    const startTick = Math.round(n.startBeat * ticksPerBeat);
    const endTick = Math.round((n.startBeat + n.durationBeats) * ticksPerBeat);
    rawEvents.push({
      tick: startTick,
      type: 'noteOn',
      pitch: n.pitch,
      velocity: n.velocity
    });
    rawEvents.push({
      tick: endTick,
      type: 'noteOff',
      pitch: n.pitch,
      velocity: 0
    });
  }

  // Sort events by tick (noteOff before noteOn on same tick)
  rawEvents.sort((a, b) => {
    if (a.tick === b.tick) {
      return a.type === 'noteOff' ? -1 : 1;
    }
    return a.tick - b.tick;
  });

  // Track data bytes
  const trackBytes: number[] = [];

  // Write Tempo meta event at tick 0
  // FF 51 03 tt tt tt (microseconds per beat)
  const mpqn = Math.round(60000000 / bpm);
  trackBytes.push(0x00); // delta time 0
  trackBytes.push(0xff, 0x51, 0x03);
  trackBytes.push((mpqn >> 16) & 0xff);
  trackBytes.push((mpqn >> 8) & 0xff);
  trackBytes.push(mpqn & 0xff);

  let lastTick = 0;
  for (const ev of rawEvents) {
    const delta = ev.tick - lastTick;
    lastTick = ev.tick;

    // Write delta-time as variable length quantity (VLQ)
    writeVLQ(trackBytes, delta);

    if (ev.type === 'noteOn') {
      trackBytes.push(0x90); // Note On channel 1
      trackBytes.push(ev.pitch & 0x7f);
      trackBytes.push(ev.velocity & 0x7f);
    } else {
      trackBytes.push(0x80); // Note Off channel 1
      trackBytes.push(ev.pitch & 0x7f);
      trackBytes.push(0x00);
    }
  }

  // End of track meta event (delta time 0, FF 2F 00)
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  // File Header: 'MThd' + length (6) + format 0 (1 track) + 1 track + ticksPerBeat
  const headerBytes: number[] = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // length 6
    0x00, 0x00,             // format 0 (single track)
    0x00, 0x01,             // 1 track
    (ticksPerBeat >> 8) & 0xff,
    ticksPerBeat & 0xff
  ];

  // Track Header: 'MTrk' + length + data
  const trackLen = trackBytes.length;
  const trackHeader: number[] = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackLen >> 24) & 0xff,
    (trackLen >> 16) & 0xff,
    (trackLen >> 8) & 0xff,
    trackLen & 0xff
  ];

  const fullFile = new Uint8Array([...headerBytes, ...trackHeader, ...trackBytes]);
  return new Blob([fullFile], { type: 'audio/midi' });
}

function writeVLQ(buffer: number[], value: number): void {
  let bufferVal = value & 0x7f;
  const bytes: number[] = [];
  while ((value >>= 7)) {
    bufferVal <<= 8;
    bufferVal |= (value & 0x7f) | 0x80;
  }
  while (true) {
    bytes.push(bufferVal & 0xff);
    if (bufferVal & 0x80) {
      bufferVal >>= 8;
    } else {
      break;
    }
  }
  buffer.push(...bytes);
}

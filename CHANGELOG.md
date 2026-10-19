# CHANGELOG — SONICFORGE STUDIO (ZELTON)

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-10-18

### Added
- **Core Digital Audio Workstation**:
  - Web Audio lookahead scheduler with 25ms timer and 100ms lookahead window.
  - Multitrack arrangement timeline with interactive canvas waveform rendering.
  - Non-destructive clip editing: trim, split, erase, duplicate, and loop pins.
  - Transport controls: Play, Pause, Stop, Rewind, Record, Metronome, Tap Tempo.
  - Project state manager with 30-step undo/redo stack and IndexedDB persistence.
- **Virtual Instruments & Synthesis**:
  - Concert Acoustic Grand Piano with 4 harmonic layers and hammer attack spike.
  - Classic Rhodes Electric Piano, Vintage B3 Organ, 808 Sub Bass, Neon Synth Lead, 80s Synth Brass, Acoustic Pluck, and Dream Ambient Pad.
  - 3D Ivory & Ebony Keyboard with acoustic red felt trim and active note visualizer.
  - Tempo-synced Arpeggiator (ARP) with 1/4, 1/8, 1/16 rates and UP / DOWN / RANDOM modes.
  - In-Key scale highlight mapping for harmonious note play.
  - 16-step Drum Sequencer with Bank A/B (32 steps), swing, and kits (808 Trap, 909, Boom Bap, Lo-Fi, Acoustic).
  - 16-pad MPC velocity-sensitive Sampler Grid mapped to QWERTY keys.
  - Piano Roll MIDI editor with note velocity and snapping.
- **Vocal Production & DSP**:
  - Microphone recording via `navigator.mediaDevices.getUserMedia`.
  - 10 BandLab vocal presets: AutoPitch, Modern Rap, Clean Air, Warm Vintage, Space Echo, Hyperpop, Vinyl Radio, Heavy Chorus, Drill Vocal, Lo-Fi Telephone.
  - Dedicated AutoPitch modal with circular LED speed dial and key/scale picker.
  - Insert Effects Rack: 3-band EQ, Compressor, Delay, Reverb, Distortion, Filter, Limiter.
- **AI Studio Assistant**:
  - In-browser AI Music Theory Assistant with chord progression generator for Trap, Pop, R&B, and Lo-Fi.
  - Automatic complementary syncopated bassline and 16-step drum groove generators.
- **Audio & MIDI Export**:
  - Offline 16-bit 44.1kHz PCM stereo WAV master mixdown exporter.
  - Multi-track individual stem audio exporter.
  - Standard Type 1 MIDI File (.mid) binary encoder.
  - Audio hardware & latency calibration settings modal.

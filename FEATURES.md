# FEATURES SPECIFICATION — SONICFORGE STUDIO (ZELTON)

## 1. Multitrack Arrangement Timeline
- Multitrack canvas with horizontal and vertical zoom.
- Interactive waveform peak rendering for recorded and imported audio clips.
- Editing tools: Pointer/Select tool (`V`), Slice/Split tool (`S`), Erase tool (`E`).
- Drag-and-drop clip repositioning with bar/beat snap grid.
- Dual-pin loop region with loop toggle (`L`).
- Real-time playhead scrubber with smooth 60fps tracking.
- Automation lanes for Volume, Pan, and Filter Cutoff with editable control points.

## 2. Virtual Instruments & Sound Modeling
- **Concert Acoustic Grand Piano**:
  - 4 harmonic layers (triangle body, sine 2nd overtone, detuned 3rd harmonic warmth, 4th harmonic sparkle).
  - Acoustic hammer strike contact spike with natural decay.
- **Classic Rhodes Electric Piano**:
  - High metallic tine harmonic strike with warm body and vibrato.
- **Vintage B3 Drawbar Organ**:
  - 4 additive drawbars (8', 4', 2 2/3', 2') with authentic key click.
- **808 Glide Sub Bass**:
  - Pitch-dropping transient into low resonant sub-sine.
- **Neon Analog Lead & Retro 80s Synth Brass**:
  - Dual detuned sawtooth oscillators with resonant lowpass filter envelope.
- **Acoustic Pluck**:
  - Fast decay acoustic plucked string with damped high harmonics.
- **Dream Ambient Pad**:
  - Lush slow-swell ambient wash with resonant sweep.

## 3. Keyboard & Control Surface
- 3D Ivory & Ebony physical keys with acoustic red felt trim.
- Key depression animations during playback and manual interaction.
- Tempo-synced Arpeggiator (ARP) with 1/4, 1/8, 1/16 rates and UP / DOWN / RANDOM modes.
- In-Key scale highlight mapping matching project root key and scale.
- Pitch Bend wheel with spring-back return and Mod wheel.
- Sustain hold/latch toggle switch.
- Rotary sound parameter controls (Attack, Release, Cutoff, Reverb).
- Full QWERTY keyboard mapping (`A-K`, `W, E, T, Y, U, O, P`, `Z/X` for octave).

## 4. Drum Sequencer & MPC Sampler
- 16-step matrix sequencer with Bank A & Bank B (32 steps total).
- 5 drum kits: `808 Trap`, `909 Classic`, `Boom Bap`, `Lo-Fi Chill`, `Acoustic Studio`.
- Swing groove slider and pattern randomizer.
- One-click "Add Pattern to Timeline" button.
- 16-pad MPC velocity-sensitive sampler grid mapped to `1-4`, `Q-R`, `A-F`, `Z-V`.

## 5. Vocal Production & AutoPitch
- Real-time microphone audio recording with input level metering.
- 10 BandLab vocal presets: AutoPitch, Modern Rap, Clean Air, Warm Vintage, Space Echo, Hyperpop, Vinyl Radio, Heavy Chorus, Drill Vocal, Lo-Fi Telephone.
- Circular LED speed dial with 5 tuning intensities: `OFF`, `LIGHT`, `MEDIUM`, `HARD`, `ROBOT`.
- Musical key and scale snapping for pitch-perfect vocal takes.

## 6. Mixing & Audio Effects
- Channel strips with vertical faders, dB indicators, stereo pan, Mute, Solo, Record-Arm.
- Stereo master peak level meter with clipping warning.
- DSP insert rack: 3-band EQ, Compressor, Stereo Delay, Algorithmic Reverb, Distortion/Drive, State-Variable Filter, Ceiling Limiter.

## 7. AI Music Studio Assistant
- Chord Progression Generator: Pop, Trap, R&B/Neo-Soul, and Lo-Fi.
- Syncopated 808 Bassline Generator: Automatically extracts root notes from chord progressions.
- Genre-authentic 16-step Drum Generator (Trap, Boom Bap, House, Drill).
- Direct "Insert into Timeline" action buttons.

## 8. Export & Interoperability
- Master Mixdown WAV: 16-bit 44.1kHz PCM stereo audio file.
- All Track Stems: Individual WAV stems for external DAW mixing.
- Standard MIDI File (.mid): Format 1 MIDI export of note data.
- Project JSON snapshot persistence in IndexedDB and LocalStorage.

# SonicForge Studio (ZELTON)

A professional browser-based Digital Audio Workstation (DAW) and AI music production suite inspired by the workflows of BandLab, GarageBand, and modern music production platforms.

Built with **React 19, TypeScript, Vite, Web Audio API, and Tailwind CSS**. Runs 100% locally on macOS (including Intel MacBook Pro 2017) and mobile browsers with zero cloud dependencies or paid APIs.

---

## Key Features

### 1. Multitrack Arrangement Timeline
- Multitrack arrangement canvas with interactive audio waveform peak rendering.
- Editing tools: Pointer/Select (`V`), Slice/Split (`S`), Erase (`E`).
- Drag-and-drop clip repositioning, bar/beat snapping, and loop region pins.
- Automation lanes for Volume, Pan, and Filter Cutoff.

### 2. Virtual Instruments & Physical Modeling
- **Concert Acoustic Grand Piano**: 4 harmonic layers with realistic hammer attack spike.
- **Classic Rhodes Electric Piano**: Metallic tine chime transient with body and vibrato.
- **Vintage B3 Drawbar Organ**: 4 additive drawbars (8', 4', 2 2/3', 2') with key-click transient.
- **808 Glide Sub Bass**: Pitch-dropping transient into low resonant sub-sine.
- **Neon Analog Lead & Retro 80s Synth Brass**: Dual detuned sawtooth waves with sweeping resonant lowpass filter.
- **Acoustic Pluck & Dream Ambient Pad**: Acoustic string pluck and ambient swell pad.

### 3. Keyboard & Control Surface
- 3D Ivory & Ebony physical keys with acoustic red felt trim.
- Active key depression animations during playback and manual playing.
- Tempo-synced Arpeggiator (ARP) with 1/4, 1/8, 1/16 rates and UP / DOWN / RANDOM modes.
- In-Key scale highlight mapping matching project root key and scale.
- Pitch Bend wheel with spring-back return and Mod wheel.
- Sustain hold/latch toggle switch.
- Sound shaper knobs: Attack, Release, Cutoff, Reverb.
- Full QWERTY keyboard mapping (`A-K`, `W, E, T, Y, U, O, P`, `Z/X` for octave).

### 4. Drum Sequencer & MPC Sampler
- 16-step drum matrix sequencer with Bank A & Bank B (32 steps total).
- 5 drum kits: `808 Trap`, `909 Classic`, `Boom Bap`, `Lo-Fi Chill`, `Acoustic Studio`.
- Swing groove slider and pattern randomizer.
- 16-pad MPC velocity-sensitive sampler grid mapped to QWERTY keys.

### 5. Vocal Production & AutoPitch
- Real-time microphone recording via `navigator.mediaDevices.getUserMedia`.
- 10 vocal presets: AutoPitch, Modern Rap, Clean Air, Warm Vintage, Space Echo, Hyperpop, Vinyl Radio, Heavy Chorus, Drill Vocal, Lo-Fi Telephone.
- Dedicated AutoPitch modal with circular LED speed dial (`OFF`, `LIGHT`, `MEDIUM`, `HARD`, `ROBOT`) and key/scale picker.

### 6. Mixing & Audio Effects
- Channel strips with vertical faders, dB indicators, stereo pan, Mute, Solo, Record-Arm.
- Stereo master peak level meter with clipping warning.
- DSP insert rack: 3-band EQ, Compressor, Stereo Delay, Algorithmic Reverb, Distortion/Drive, State-Variable Filter, Ceiling Limiter.

### 7. AI Music Studio Assistant
- In-browser AI Music Theory Assistant with chord progression generator for Trap, Pop, R&B, and Lo-Fi.
- Automated complementary syncopated bassline and 16-step drum groove generators.
- Direct timeline insertion.

### 8. Exporting & Interoperability
- **Mixdown WAV**: 16-bit 44.1kHz PCM stereo audio master.
- **All Track Stems**: Export each track as separate WAV files for external DAW mixing.
- **Standard MIDI File (.mid)**: Format 1 MIDI export of note data.
- **Session Persistence**: IndexedDB / LocalStorage backup with 30-step undo/redo stack.

---

## Getting Started

### Installation & Development Server
```bash
# Enter directory
cd zelton

# Install dependencies
npm install

# Start development server
npx vite --port 3000
```
Open [http://localhost:3000](http://localhost:3000) (or the active port reported by Vite) in your browser.

### Running Automated Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

## Live Demo & Deployment
- **Live Website**: [https://void4ux.github.io/zelton-deploy/](https://void4ux.github.io/zelton-deploy/)
- **Repository**: [https://github.com/void4ux/zelton-deploy](https://github.com/void4ux/zelton-deploy)


# ARCHITECTURE — SONICFORGE STUDIO (ZELTON)

## 1. System Overview

SonicForge Studio (codename **ZELTON**) is a browser-based, local-first Digital Audio Workstation (DAW) and AI music production suite. It runs directly inside client web browsers on desktop (including Intel MacBook Pro 2017) and mobile without requiring server-side audio rendering, cloud GPUs, or paid proprietary APIs.

```
+-------------------------------------------------------------------------+
|                      SonicForge Studio UI (React 19)                    |
|  [TopNav] [Arrangement Timeline] [Virtual Piano] [Mixer] [Piano Roll]   |
|         [Drum Sequencer] [AutoPitch Modal] [AI Assistant Modal]         |
+------------------------------------+------------------------------------+
                                     | Event & State Bus
+------------------------------------v------------------------------------+
|                      Zelton Audio Engine Core                           |
|  - Precision Lookahead Web Audio Scheduler (25ms timer, 100ms window)  |
|  - Multi-harmonic Acoustic Physical Modeling Synthesizer               |
|  - Procedural Web Audio 808/909 Drum Engine                            |
|  - 10-Preset Vocal DSP Chain (AutoPitch Peaking Resonance, Tape, EQ3)  |
|  - OfflineAudioContext 16-bit 44.1kHz PCM WAV Exporter & Stem Renderer |
|  - Standard Type 1 MIDI File (.mid) Binary Serializer                   |
+------------------------------------+------------------------------------+
                                     | Web Audio Nodes & Hardware
+------------------------------------v------------------------------------+
|  BaseAudioContext -> GainNodes -> BiquadFilters -> Analyser -> Speakers |
|  MediaDevices.getUserMedia -> MediaRecorder / PCM Capture Pipeline      |
|  IndexedDB & LocalStorage Snapshot Persistence Manager                  |
+-------------------------------------------------------------------------+
```

---

## 2. Audio Pipeline & Routing

### Real-Time Signal Flow
Every track maintains an independent audio sub-graph routed through:
1. **Source Node**:
   - `AudioBufferSourceNode` (for recorded mic audio clips or imported WAV/MP3 samples).
   - `InstrumentEngine` layered harmonic oscillators (Grand Piano, Rhodes, Organ, 808 Bass, Synth Lead, Pluck, Pad, Brass).
   - `DrumSynth` procedural transient generators (Kick, Snare, Clap, Hi-Hat, Tom).
2. **Channel Insert Effects Chain**:
   - Dynamic DSP chain: 3-band EQ (`EQ3`), Compressor, Stereo Delay, Algorithmic Reverb, Distortion/Tape Drive, State-Variable Filter, Limiter.
3. **Panner & Volume Fader**:
   - `StereoPannerNode` (-1.0 Left to +1.0 Right).
   - Channel `GainNode` with logarithmic volume curve.
4. **Master Bus & Metering**:
   - Summing `masterGain` node with ceiling limiter.
   - `AnalyserNode` feeding real-time RMS / peak meter display in top navigation.

### Lookahead Scheduling Architecture
To prevent browser event loop jitter from introducing audio artifacts or timing drifts:
- Web Audio `ctx.currentTime` serves as the authoritative master clock.
- The scheduler runs on a 25ms timer polling ahead 100ms (`scheduleAheadSec = 0.1`).
- MIDI notes and drum steps are scheduled into `BaseAudioContext` using precise audio-rate parameter ramps (`setValueAtTime`, `linearRampToValueAtTime`, `exponentialRampToValueAtTime`).

---

## 3. Storage & State Architecture

### Local-First Persistence
- **State Store**: React hook-based atomic updates with immutable state snapshots.
- **Undo / Redo History**: 30-step deep snapshot stack managed by `ProjectStore`.
- **Serialization**: Complete project schema serialized to JSON in `localStorage` and `IndexedDB`.
- **Audio Buffers**: Decoded PCM memory buffers are stored in memory during active sessions; raw blobs are serialized into IndexedDB binary stores to avoid browser memory bloat.

---

## 4. AI Music Assistant Architecture

- **In-Browser Theory Engine**: Deterministic music theory module with interval mapping for Major, Minor, Pentatonic, and Chromatic scales.
- **Progression Database**: Curated 4-bar chord progressions spanning Pop, Trap/Hip-Hop, Neo-Soul/R&B, and Lo-Fi.
- **Procedural Bassline & Drum Pattern Generator**: Automatically extracts chord roots and generates syncopated 808 sub bass grooves and genre-accurate 16-step drum patterns.
- **Safe Tool API**: Exposes non-destructive actions (`onAddTrackWithClip`, `onUpdateProject`) with full undo/redo rollback protection.

# TESTING & VERIFICATION STRATEGY

## 1. Automated Test Suite

SonicForge Studio (ZELTON) uses **Vitest** for deterministic, fast unit and integration testing.

Run the test suite:
```bash
npm test
```

### Verified Test Cases (`src/tests/daw.test.ts`)
1. **MIDI Pitch to Frequency Conversion**:
   - Accurately converts MIDI note numbers (A4 = 69 -> 440Hz, C4 = 60 -> ~261.63Hz, C2 = 36 -> ~65.41Hz, C5 = 72 -> ~523.25Hz).
2. **Musical Timing & Beat Subdivisions**:
   - Calculates bar, beat, and 16th note subdivisions accurately across standard 4/4 time.
3. **Clip Splitting & Non-Destructive Offsets**:
   - Verifies that splitting audio and MIDI clips maintains exact sample lengths without losing original source offsets.
4. **Project State Serialization & Deserialization**:
   - Verifies full JSON serialization of tracks, clips, automation, and project settings with 100% data fidelity.
5. **Undo / Redo History Management**:
   - Tests pushing project snapshots and verifying exact state reversal across editing history.
6. **Standard MIDI (.mid) Binary Encoding**:
   - Verifies creation of valid Type 1 Standard MIDI Files with correct `MThd` and `MTrk` chunk headers and VLQ delta times.
7. **AI Music Assistant Generator Verification**:
   - Tests chord generation, complementary syncopated basslines, and 16-step drum grooves with velocity dynamics.

---

## 2. Production Build Verification

Verify that TypeScript type checking and Vite bundle compilation execute cleanly with 0 errors:
```bash
npm run build
```

Expected output:
- `dist/index.html` (~1 kB)
- `dist/assets/index-*.css` (~54 kB)
- `dist/assets/index-*.js` (~383 kB)

---

## 3. Manual Testing & Verification Workflow

1. **Launch Dev Server**:
   ```bash
   npx vite --port 3000
   ```
2. **Audio Playback**:
   - Click Play (or press `Spacebar`).
   - Listen to the default demo song featuring 808 Trap Drums, Grand Piano chords, Neon Lead, and Sub Bassline.
3. **Virtual Instruments**:
   - Select the Grand Piano track in the bottom panel.
   - Play with keys `A-K` and `W, E, T, Y, U, O, P` or click the 3D keys.
   - Switch presets to Classic Rhodes, Vintage Organ, 808 Sub Bass, etc.
4. **Recording Take**:
   - Click the Voice/Mic track Record-Arm button (`R`).
   - Click Record in top navigation. Speak or sing into the microphone.
   - Stop recording and observe the rendered waveform clip on the arrangement timeline.
5. **AutoPitch Dial**:
   - Click AutoPitch in the top bar. Turn dial to `HARD` or `ROBOT`. Play vocal clip.
6. **AI Assistant**:
   - Click `AI ASSIST` in the top bar. Select a Trap, Pop, or Lo-Fi chord progression and click "Insert Piano Chords".
   - Observe the new track and MIDI chord clip added directly to the timeline.
7. **Export Audio & MIDI**:
   - In the Export menu, select "Mixdown WAV". Check downloaded `.wav` file in media player.
   - Select "Standard MIDI (.mid)" and verify import into external MIDI software.

# SECURITY & PRIVACY POLICY — SONICFORGE STUDIO (ZELTON)

## 1. Local-First Privacy Architecture
- SonicForge Studio operates on a **100% local-first model**.
- Audio recording, synthesis, DSP processing, and project persistence run entirely in the user's browser.
- Microphone recordings are never transmitted to any external server or cloud service without explicit user consent.

## 2. Audio Hardware & Permissions
- Microphone access is requested only when the user explicitly triggers an audio recording action or enables input monitoring.
- Permission revocation or device disconnection is handled gracefully without crashing the audio context.
- Feedback protection is implemented to automatically prevent acoustic feedback loops through monitor guards.

## 3. Input Validation & Safe File Handling
- Imported audio files (WAV, MP3, OGG) are processed via native browser `AudioContext.decodeAudioData()`.
- File sizes and MIME types are checked before allocating memory buffers to prevent denial-of-service through memory exhaustion.
- Project JSON files are parsed with schema validation; executable scripts or malicious prototypes inside imported session archives are ignored.

## 4. Secret & API Key Management
- SonicForge Studio's AI Music Assistant utilizes client-side music theory algorithms and procedural generators by default, requiring zero third-party API keys or cloud credentials.
- When optional third-party AI provider adapters are configured, all credentials must reside in environment variables (`.env`) rather than exposed in client-side bundles.

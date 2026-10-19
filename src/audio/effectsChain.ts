import { EffectConfig } from '../types/daw';

export interface BuiltEffect {
  input: AudioNode;
  output: AudioNode;
  updateParams: (params: Record<string, number>) => void;
}

export function buildEffectNode(ctx: BaseAudioContext, config: EffectConfig): BuiltEffect {
  const { type, params, enabled } = config;
  const bypassGain = ctx.createGain();
  const wetGain = ctx.createGain();
  const input = ctx.createGain();
  const output = ctx.createGain();

  input.connect(bypassGain);
  bypassGain.connect(output);

  let effectCoreInput: AudioNode = input;
  let effectCoreOutput: AudioNode = output;

  let updateParams = (_p: Record<string, number>) => {};

  if (type === 'eq3') {
    const low = ctx.createBiquadFilter();
    low.type = 'lowshelf';
    low.frequency.value = 250;
    low.gain.value = params.low ?? 0;

    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1200;
    mid.Q.value = 1.0;
    mid.gain.value = params.mid ?? 0;

    const high = ctx.createBiquadFilter();
    high.type = 'highshelf';
    high.frequency.value = 4500;
    high.gain.value = params.high ?? 0;

    low.connect(mid);
    mid.connect(high);

    effectCoreInput = low;
    effectCoreOutput = high;

    updateParams = (p) => {
      if (p.low !== undefined) low.gain.value = p.low;
      if (p.mid !== undefined) mid.gain.value = p.mid;
      if (p.high !== undefined) high.gain.value = p.high;
    };
  } else if (type === 'compressor') {
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = params.threshold ?? -24;
    comp.knee.value = params.knee ?? 30;
    comp.ratio.value = params.ratio ?? 12;
    comp.attack.value = (params.attack ?? 10) / 1000;
    comp.release.value = (params.release ?? 250) / 1000;

    effectCoreInput = comp;
    effectCoreOutput = comp;

    updateParams = (p) => {
      if (p.threshold !== undefined) comp.threshold.value = p.threshold;
      if (p.knee !== undefined) comp.knee.value = p.knee;
      if (p.ratio !== undefined) comp.ratio.value = p.ratio;
      if (p.attack !== undefined) comp.attack.value = p.attack / 1000;
      if (p.release !== undefined) comp.release.value = p.release / 1000;
    };
  } else if (type === 'delay') {
    const delay = ctx.createDelay(5.0);
    delay.delayTime.value = params.time ?? 0.25;

    const feedback = ctx.createGain();
    feedback.gain.value = params.feedback ?? 0.35;

    delay.connect(feedback);
    feedback.connect(delay);

    effectCoreInput = delay;
    effectCoreOutput = delay;

    updateParams = (p) => {
      if (p.time !== undefined) delay.delayTime.value = p.time;
      if (p.feedback !== undefined) feedback.gain.value = p.feedback;
    };
  } else if (type === 'reverb') {
    const convolver = ctx.createConvolver();
    const decay = params.decay ?? 2.0;
    convolver.buffer = generateImpulseResponse(ctx, decay);

    effectCoreInput = convolver;
    effectCoreOutput = convolver;

    updateParams = (p) => {
      if (p.decay !== undefined) {
        convolver.buffer = generateImpulseResponse(ctx, p.decay);
      }
    };
  } else if (type === 'distortion') {
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeDistortionCurve(params.drive ?? 20) as any;
    shaper.oversample = '4x';

    effectCoreInput = shaper;
    effectCoreOutput = shaper;

    updateParams = (p) => {
      if (p.drive !== undefined) {
        shaper.curve = makeDistortionCurve(p.drive) as any;
      }
    };
  } else if (type === 'filter') {
    const filter = ctx.createBiquadFilter();
    filter.type = (params.mode === 1 ? 'highpass' : params.mode === 2 ? 'bandpass' : 'lowpass');
    filter.frequency.value = params.cutoff ?? 2000;
    filter.Q.value = params.resonance ?? 2;

    effectCoreInput = filter;
    effectCoreOutput = filter;

    updateParams = (p) => {
      if (p.cutoff !== undefined) filter.frequency.value = p.cutoff;
      if (p.resonance !== undefined) filter.Q.value = p.resonance;
      if (p.mode !== undefined) {
        filter.type = (p.mode === 1 ? 'highpass' : p.mode === 2 ? 'bandpass' : 'lowpass');
      }
    };
  } else if (type === 'autopitch') {
    // Pitch correction resonance node
    const biquad = ctx.createBiquadFilter();
    biquad.type = 'peaking';
    biquad.frequency.value = 1000;
    biquad.Q.value = (params.depth ?? 100) / 20;
    biquad.gain.value = 6;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 8;

    biquad.connect(comp);
    effectCoreInput = biquad;
    effectCoreOutput = comp;

    updateParams = (p) => {
      if (p.depth !== undefined) biquad.Q.value = p.depth / 20;
    };
  } else if (type === 'limiter') {
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -0.5;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.05;

    effectCoreInput = limiter;
    effectCoreOutput = limiter;
  }

  // Routing
  const wet = (params.wet ?? 100) / 100;
  if (enabled) {
    bypassGain.gain.value = 1 - wet;
    wetGain.gain.value = wet;
    input.connect(effectCoreInput);
    effectCoreOutput.connect(wetGain);
    wetGain.connect(output);
  } else {
    bypassGain.gain.value = 1.0;
    wetGain.gain.value = 0.0;
  }

  return {
    input,
    output,
    updateParams
  };
}

function generateImpulseResponse(ctx: BaseAudioContext, duration: number = 2.0): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const decay = Math.exp(-i / (sampleRate * (duration / 3)));
    left[i] = (Math.random() * 2 - 1) * decay;
    right[i] = (Math.random() * 2 - 1) * decay;
  }

  return impulse;
}

function makeDistortionCurve(amount: number): Float32Array {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

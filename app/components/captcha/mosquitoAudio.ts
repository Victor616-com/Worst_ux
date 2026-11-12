/**
 * Synthesised sound effects for the mosquito step (Web Audio API, no files).
 * - buzz: continuous whine; call `setBuzz` every frame with position and speed
 * - smack: hard slap with a low thump
 * - whoosh: swatter swinging through air
 */
export function createMosquitoAudio() {
  const ctx = new AudioContext()
  const master = ctx.createGain()
  master.gain.value = 0.8
  master.connect(ctx.destination)

  // shared white noise buffer
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  function noiseSource() {
    const src = ctx.createBufferSource()
    src.buffer = noise
    return src
  }

  // ---- buzz ---------------------------------------------------------------
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = 600

  // slow wobble in pitch, like wings speeding up and slowing down
  const wobble = ctx.createOscillator()
  wobble.frequency.value = 7
  const wobbleDepth = ctx.createGain()
  wobbleDepth.gain.value = 30
  wobble.connect(wobbleDepth).connect(osc.frequency)

  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1400
  band.Q.value = 0.8

  const buzzGain = ctx.createGain()
  buzzGain.gain.value = 0
  const pan = ctx.createStereoPanner()

  osc.connect(band).connect(buzzGain).connect(pan).connect(master)
  osc.start()
  wobble.start()

  let buzzOn = true

  /** x: 0..1 across the play area, speed: px per frame */
  function setBuzz(x: number, speed: number) {
    const t = ctx.currentTime
    const s = Math.min(speed / 10, 1)
    pan.pan.setTargetAtTime(x * 2 - 1, t, 0.05)
    osc.frequency.setTargetAtTime(560 + s * 140, t, 0.05)
    buzzGain.gain.setTargetAtTime(buzzOn ? 0.05 + s * 0.09 : 0, t, 0.05)
  }

  function buzz(on: boolean) {
    buzzOn = on
    buzzGain.gain.setTargetAtTime(on ? 0.05 : 0, ctx.currentTime, on ? 0.15 : 0.01)
  }

  // ---- smack --------------------------------------------------------------
  function smack() {
    const t = ctx.currentTime

    // sharp crack
    const crack = noiseSource()
    const crackFilter = ctx.createBiquadFilter()
    crackFilter.type = 'bandpass'
    crackFilter.frequency.value = 2500
    crackFilter.Q.value = 0.7
    const crackGain = ctx.createGain()
    crackGain.gain.setValueAtTime(1.2, t)
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    crack.connect(crackFilter).connect(crackGain).connect(master)
    crack.start(t)
    crack.stop(t + 0.15)

    // low thump of the swatter hitting the wall
    const thump = ctx.createOscillator()
    thump.type = 'sine'
    thump.frequency.setValueAtTime(180, t)
    thump.frequency.exponentialRampToValueAtTime(50, t + 0.12)
    const thumpGain = ctx.createGain()
    thumpGain.gain.setValueAtTime(0.9, t)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    thump.connect(thumpGain).connect(master)
    thump.start(t)
    thump.stop(t + 0.2)
  }

  // ---- whoosh -------------------------------------------------------------
  function whoosh() {
    const t = ctx.currentTime
    const src = noiseSource()
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 1.5
    filter.frequency.setValueAtTime(400, t)
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.18)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, t)
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    src.connect(filter).connect(gain).connect(master)
    src.start(t)
    src.stop(t + 0.25)
  }

  function setMuted(muted: boolean) {
    master.gain.setTargetAtTime(muted ? 0 : 0.8, ctx.currentTime, 0.02)
  }

  /** Browsers start audio suspended until a user gesture. */
  function resume() {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  }

  function dispose() {
    if (ctx.state !== 'closed') ctx.close().catch(() => {})
  }

  return { setBuzz, buzz, smack, whoosh, setMuted, resume, dispose }
}

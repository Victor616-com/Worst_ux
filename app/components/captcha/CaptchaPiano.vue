<script setup lang="ts">
import { gsap } from 'gsap'

const emit = defineEmits<{ pass: [] }>()

interface Key { note: string, freq: number, black: boolean, kbd: string }

// One octave C4..C5 plus the computer keys that play them
const KEYS: Key[] = [
  { note: 'C', freq: 261.63, black: false, kbd: 'a' },
  { note: 'C#', freq: 277.18, black: true, kbd: 'w' },
  { note: 'D', freq: 293.66, black: false, kbd: 's' },
  { note: 'D#', freq: 311.13, black: true, kbd: 'e' },
  { note: 'E', freq: 329.63, black: false, kbd: 'd' },
  { note: 'F', freq: 349.23, black: false, kbd: 'f' },
  { note: 'F#', freq: 369.99, black: true, kbd: 't' },
  { note: 'G', freq: 392.0, black: false, kbd: 'g' },
  { note: 'G#', freq: 415.3, black: true, kbd: 'y' },
  { note: 'A', freq: 440.0, black: false, kbd: 'h' },
  { note: 'A#', freq: 466.16, black: true, kbd: 'u' },
  { note: 'B', freq: 493.88, black: false, kbd: 'j' },
  { note: 'C5', freq: 523.25, black: false, kbd: 'k' },
]
const WHITE = KEYS.filter(k => !k.black)
const BLACK = KEYS.filter(k => k.black)
// left edge of each black key, as a fraction of the white-key row
const blackLeft = (k: Key) => {
  const before = KEYS.slice(0, KEYS.indexOf(k)).filter(x => !x.black).length
  return `${(before / WHITE.length) * 100 - 4}%`
}

// "Twinkle twinkle little star, how I wonder what you are"
const SONG = [
  { note: 'C', word: 'Twin' }, { note: 'C', word: 'kle' },
  { note: 'G', word: 'twin' }, { note: 'G', word: 'kle' },
  { note: 'A', word: 'lit' }, { note: 'A', word: 'tle' },
  { note: 'G', word: 'star,' },
  { note: 'F', word: 'how' }, { note: 'F', word: 'I' },
  { note: 'E', word: 'won' }, { note: 'E', word: 'der' },
  { note: 'D', word: 'what' }, { note: 'D', word: 'you' },
  { note: 'C', word: 'are.' },
]

const position = ref(0)
const pressed = ref<string | null>(null)
const message = ref('Play the first line. One wrong note and you start again.')
const status = ref<'' | 'wrong' | 'done'>('')
const demo = ref(false)

// ---- sound --------------------------------------------------------------
let ctx: AudioContext | undefined
function audio() {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, length = 1.2, volume = 0.35) {
  const ac = audio()
  const t = ac.currentTime
  const out = ac.createGain()
  out.gain.setValueAtTime(0.0001, t)
  out.gain.exponentialRampToValueAtTime(volume, t + 0.01)
  out.gain.exponentialRampToValueAtTime(0.0001, t + length)
  out.connect(ac.destination)
  // a few harmonics so it sounds more like a piano than a beep
  for (const [mult, type, amp] of [[1, 'triangle', 1], [2, 'sine', 0.35], [3, 'sine', 0.12]] as const) {
    const osc = ac.createOscillator()
    osc.type = type
    osc.frequency.value = freq * mult
    const g = ac.createGain()
    g.gain.value = amp
    osc.connect(g).connect(out)
    osc.start(t)
    osc.stop(t + length)
  }
}

function sourChord() {
  for (const f of [233.08, 246.94, 261.63]) tone(f, 0.7, 0.2) // clashing semitones
}

// ---- playing ------------------------------------------------------------
function flash(note: string) {
  pressed.value = note
  setTimeout(() => {
    if (pressed.value === note) pressed.value = null
  }, 180)
}

function play(key: Key) {
  if (demo.value || status.value === 'done') return
  tone(key.freq)
  flash(key.note)

  const expected = SONG[position.value]!.note
  if (key.note !== expected) {
    status.value = 'wrong'
    message.value = position.value === 0
      ? 'That is not how it starts.'
      : `Wrong note after ${position.value} correct. From the top!`
    position.value = 0
    setTimeout(sourChord, 120)
    return
  }

  status.value = ''
  position.value++
  if (position.value === SONG.length) {
    status.value = 'done'
    message.value = 'Bravo. 🌟 The star thanks you.'
    setTimeout(() => emit('pass'), 1400)
  }
}

function listen() {
  if (demo.value) return
  demo.value = true
  position.value = 0
  status.value = ''
  message.value = 'Listen carefully…'
  const tl = gsap.timeline({
    onComplete() {
      demo.value = false
      message.value = 'Your turn.'
    },
  })
  SONG.forEach((s, i) => {
    // the last note of each phrase is held twice as long
    const at = i * 0.45 + (i > 6 ? 0.45 : 0)
    tl.call(() => {
      const key = KEYS.find(k => k.note === s.note)!
      tone(key.freq, 0.8)
      flash(s.note)
    }, [], at)
  })
  tl.to({}, { duration: 0.6 })
}

function onKeydown(e: KeyboardEvent) {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return
  const key = KEYS.find(k => k.kbd === e.key.toLowerCase())
  if (!key) return
  e.preventDefault()
  play(key)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  ctx?.close()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-start justify-between gap-4 text-sm">
      <span :class="status === 'wrong' ? 'text-[var(--w95-bad)]' : status === 'done' ? 'text-[var(--w95-ok)]' : ''" role="status">
        {{ message }}
      </span>
      <button type="button" class="w95-btn shrink-0 flex items-center gap-1.5" :disabled="demo" @click="listen">
        <span class="i-carbon-play-filled" /> Listen
      </button>
    </div>

    <!-- lyrics, lit up as you go -->
    <p class="w95-sunken flex flex-wrap gap-x-1.5 gap-y-1 px-2.5! py-2! text-lg leading-snug">
      <span
        v-for="(s, i) in SONG"
        :key="i"
        class="transition-colors"
        :class="i < position ? 'bg-[var(--w95-navy)] text-white px-0.5' : i === position && !demo ? 'underline underline-offset-4' : 'text-[#808080]'"
      >{{ s.word }}</span>
    </p>

    <!-- keyboard -->
    <div class="w95-sunken relative h-44 select-none touch-manipulation bg-black!">
      <div class="flex h-full gap-px">
        <button
          v-for="k in WHITE"
          :key="k.note"
          type="button"
          class="flex-1 flex flex-col justify-end items-center pb-2 text-xs cursor-pointer"
          :class="pressed === k.note ? 'bg-[#ffff80] shadow-[inset_2px_2px_#808080]' : 'bg-white shadow-[inset_-2px_-2px_#c0c0c0] hover:bg-[#f2f2f2]'"
          :aria-label="`${k.note} key`"
          @pointerdown.prevent="play(k)"
        >
          <span class="font-semibold">{{ k.note.replace('5', '') }}</span>
          <span class="uppercase text-[#808080]">{{ k.kbd }}</span>
        </button>
      </div>
      <button
        v-for="k in BLACK"
        :key="k.note"
        type="button"
        class="absolute top-0.5 w-[8%] h-[60%] flex items-end justify-center pb-1 text-[10px] text-[#a0a0a0] uppercase cursor-pointer"
        :class="pressed === k.note ? 'bg-[var(--w95-navy)]' : 'bg-[#202020] shadow-[inset_-2px_-2px_#000,inset_2px_2px_#505050] hover:bg-[#303030]'"
        :style="{ left: blackLeft(k) }"
        :aria-label="`${k.note} key`"
        @pointerdown.prevent="play(k)"
      >
        {{ k.kbd }}
      </button>
    </div>

    <p class="text-xs text-[#404040]">Click the keys or use your keyboard (A S D F G H J K).</p>
  </div>
</template>

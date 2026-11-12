<script setup lang="ts">
import { gsap } from 'gsap'

const emit = defineEmits<{ pass: [] }>()

const RADIUS = 110
const SHAKES_NEEDED = 12
const SHAKE_WINDOW_MS = 1200

const scene = ref<HTMLElement>()
const broken = ref(false)
const lit = ref(false)
const shake = ref(0)
const message = ref('')

const rand = (a: number, b: number) => Math.random() * (b - a) + a
const place = () => ({ left: `${rand(6, 92)}%`, top: `${rand(12, 88)}%` })

const decor = ['🪴', '🖼️', '🛋️', '🕰️', '🧸', '📚', '🕯️', '🪑'].map(e => ({ e, ...place(), size: rand(28, 56) }))
const scribbles = ['not here', 'warmer…', 'colder', 'it was never here', 'behind you', 'try the left', 'try the right', '👀']
  .map(t => ({ t, ...place(), rot: rand(-25, 25) }))
// Every switch looks the same. Only one is real; the rest are cockroaches.
const switches = ref(Array.from({ length: 6 }, (_, i) => ({ id: i, real: i === 0, ...place() })))

const torch = { r: 0, x: -999, y: -999 }
function paint() {
  const el = scene.value
  if (!el) return
  el.style.setProperty('--x', `${torch.x}px`)
  el.style.setProperty('--y', `${torch.y}px`)
  el.style.setProperty('--r', `${torch.r}px`)
}

let breakTimer: ReturnType<typeof setTimeout> | undefined
let decayTimer: ReturnType<typeof setInterval> | undefined
let reversals: number[] = []
let lastX = 0
let lastDir = 0

function scheduleBreak() {
  clearTimeout(breakTimer)
  breakTimer = setTimeout(breakTorch, rand(2500, 6000))
}

function breakTorch() {
  if (broken.value || lit.value) return
  clearTimeout(breakTimer)
  const tl = gsap.timeline({
    onComplete() {
      broken.value = true
      reversals = []
      shake.value = 0
    },
  })
  for (let i = 0; i < 5; i++) {
    tl.to(torch, { r: rand(0, 40), duration: 0.05, onUpdate: paint })
      .to(torch, { r: RADIUS, duration: 0.06, onUpdate: paint })
  }
  tl.to(torch, { r: 0, duration: 0.1, onUpdate: paint })
}

function fix() {
  broken.value = false
  message.value = ''
  gsap.to(torch, { r: RADIUS, duration: 0.3, onUpdate: paint })
  scheduleBreak()
}

function onMove(e: PointerEvent) {
  torch.x = e.clientX
  torch.y = e.clientY
  paint()

  const dx = e.clientX - lastX
  lastX = e.clientX
  if (!broken.value || Math.abs(dx) < 4) return

  const dir = Math.sign(dx)
  if (lastDir && dir !== lastDir) {
    const now = performance.now()
    reversals = reversals.filter(t => now - t < SHAKE_WINDOW_MS)
    reversals.push(now)
    shake.value = Math.min(1, reversals.length / SHAKES_NEEDED)
    if (reversals.length >= SHAKES_NEEDED) fix()
  }
  lastDir = dir
}

function clickSwitch(id: number, real: boolean) {
  if (broken.value || lit.value) return
  if (!real) {
    switches.value = switches.value.filter(s => s.id !== id)
    message.value = 'That was a cockroach. 🪳 It ran off and your torch broke.'
    gsap.killTweensOf(torch)
    breakTorch()
    return
  }
  lit.value = true
  clearTimeout(breakTimer)
  gsap.killTweensOf(torch)
  message.value = 'Let there be light.'
  gsap.to(torch, { r: 3000, duration: 1, ease: 'power2.in', onUpdate: paint, onComplete: () => emit('pass') })
}

onMounted(() => {
  paint()
  gsap.to(torch, { r: RADIUS, duration: 0.8, delay: 0.6, onUpdate: paint })
  scheduleBreak()
  // shake progress fades if you stop shaking
  decayTimer = setInterval(() => {
    if (!broken.value) return
    const now = performance.now()
    reversals = reversals.filter(t => now - t < SHAKE_WINDOW_MS)
    shake.value = Math.min(1, reversals.length / SHAKES_NEEDED)
  }, 150)
})

onBeforeUnmount(() => {
  clearTimeout(breakTimer)
  clearInterval(decayTimer)
  gsap.killTweensOf(torch)
})
</script>

<template>
  <div class="stage bg-ink text-white/70 h-40 center flex-col gap-2">
    <span class="text-3xl">🔌</span>
    <p class="font-bold">The power went out…</p>
  </div>

  <Teleport to="body">
    <div class="fixed inset-0 z-[100] bg-black cursor-none select-none overflow-hidden font-sans" @pointermove="onMove">
      <div
        ref="scene"
        class="torch-scene absolute inset-0"
        :class="{ 'pointer-events-none': broken }"
      >
        <span
          v-for="(d, i) in decor"
          :key="`d${i}`"
          class="absolute"
          :style="{ left: d.left, top: d.top, fontSize: `${d.size}px` }"
        >{{ d.e }}</span>

        <span
          v-for="(s, i) in scribbles"
          :key="`s${i}`"
          class="absolute font-serif italic text-red-900/80 text-lg"
          :style="{ left: s.left, top: s.top, transform: `rotate(${s.rot}deg)` }"
        >{{ s.t }}</span>

        <button
          v-for="s in switches"
          :key="s.id"
          type="button"
          class="absolute w-6 h-9 rounded-md bg-[#f3ead8] border-2 border-ink center cursor-none shadow-[2px_2px_0_0_#16130f]"
          :style="{ left: s.left, top: s.top }"
          aria-label="Light switch"
          @pointerdown.stop="clickSwitch(s.id, s.real)"
        >
          <span class="block w-2.5 h-4 rounded-sm bg-white border-2 border-ink" />
        </button>
      </div>

      <!-- HUD: always visible, outside the torch mask -->
      <div class="absolute top-5 inset-x-0 center pointer-events-none">
        <span class="chip bg-tangerine">🔦 Find the light switch</span>
      </div>

      <div v-if="broken" class="absolute inset-0 center pointer-events-none">
        <div class="card bg-paper! px-6 py-5 flex flex-col items-center gap-3 text-ink">
          <p class="heading text-xl">Your torch broke!</p>
          <p class="text-sm text-muted">Shake your mouse to fix it.</p>
          <div class="w-56 h-4 rounded-full border-2 border-ink bg-white overflow-hidden">
            <div class="h-full bg-tangerine border-r-2 border-ink transition-all duration-150" :style="{ width: `${shake * 100}%` }" />
          </div>
        </div>
      </div>

      <div v-if="message" class="absolute bottom-8 inset-x-0 center px-4 pointer-events-none">
        <p class="note max-w-md text-center">{{ message }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.torch-scene {
  --x: -999px;
  --y: -999px;
  --r: 0px;
  background:
    repeating-linear-gradient(90deg, transparent 0 38px, rgb(0 0 0 / 0.15) 38px 40px),
    #3b2a1e;
  -webkit-mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), #000 45%, transparent 100%);
  mask-image: radial-gradient(circle var(--r) at var(--x) var(--y), #000 45%, transparent 100%);
}
</style>

<script setup lang="ts">
import { gsap } from 'gsap'
import { createMosquitoAudio } from './mosquitoAudio'

const emit = defineEmits<{ pass: [] }>()

const NEEDED = 3
const MOSQUITO = 34 // px, emoji size
const SWAT_RADIUS = 30 // how close the swatter head must be to the mosquito

const area = ref<HTMLElement>()
const bug = ref<HTMLElement>()
const swatter = ref<HTMLElement>()
const kills = ref(0)
const splats = ref<{ id: number, x: number, y: number }[]>([])
const message = ref('Smack the mosquito 3 times.')
const hovering = ref(false)
const dead = ref(false)
const muted = ref(false)

let audio: ReturnType<typeof createMosquitoAudio> | undefined
let lastPos = { x: 0, y: 0 }

// every frame: feed the bug's position and speed into the buzz
function tick() {
  if (!audio || !bug.value || !area.value) return
  const x = gsap.getProperty(bug.value, 'x') as number
  const y = gsap.getProperty(bug.value, 'y') as number
  const speed = Math.hypot(x - lastPos.x, y - lastPos.y)
  lastPos = { x, y }
  audio.setBuzz(Math.min(Math.max(x / area.value.clientWidth, 0), 1), speed)
}

function toggleMute() {
  muted.value = !muted.value
  audio?.setMuted(muted.value)
}

const rand = (a: number, b: number) => Math.random() * (b - a) + a
let flight: gsap.core.Tween | undefined
let splatId = 0

function fly() {
  if (!area.value || !bug.value || dead.value) return
  const x = rand(0, area.value.clientWidth - MOSQUITO)
  const y = rand(0, area.value.clientHeight - MOSQUITO)
  const fromX = gsap.getProperty(bug.value, 'x') as number
  gsap.set(bug.value, { scaleX: x < fromX ? 1 : -1 }) // face the way it flies
  flight = gsap.to(bug.value, {
    x,
    y,
    duration: rand(0.6, 1.3),
    ease: 'sine.inOut',
    onComplete: () => {
      // hover in place for a moment, like mosquitoes do right before your ear
      gsap.delayedCall(rand(0.1, 0.6), fly)
    },
  })
}

function moveSwatter(e: PointerEvent) {
  const r = area.value!.getBoundingClientRect()
  gsap.set(swatter.value!, { x: e.clientX - r.left, y: e.clientY - r.top })
}

function swat(e: PointerEvent) {
  audio?.resume()
  if (dead.value || kills.value >= NEEDED) return
  const r = area.value!.getBoundingClientRect()
  const px = e.clientX - r.left
  const py = e.clientY - r.top

  gsap.fromTo(swatter.value!.firstElementChild!, { rotate: -35, scale: 1.15 }, { rotate: 0, scale: 1, duration: 0.18, ease: 'power3.in' })

  const bx = (gsap.getProperty(bug.value!, 'x') as number) + MOSQUITO / 2
  const by = (gsap.getProperty(bug.value!, 'y') as number) + MOSQUITO / 2
  const hit = Math.hypot(px - bx, py - by) <= SWAT_RADIUS

  if (!hit) {
    audio?.whoosh()
    message.value = ['Whoosh. Missed.', 'It laughed at you.', 'Bzzzz.', 'You hit the air. The air is fine.'][(Math.random() * 4) | 0]!
    return
  }

  kills.value++
  dead.value = true
  audio?.smack()
  audio?.buzz(false)
  flight?.kill()
  gsap.killTweensOf(fly)
  splats.value.push({ id: splatId++, x: bx, y: by })
  gsap.to(bug.value!, { opacity: 0, scale: 0.3, duration: 0.15 })

  if (kills.value >= NEEDED) {
    message.value = 'Got them all. Probably.'
    setTimeout(() => emit('pass'), 900)
    return
  }

  message.value = kills.value === 1 ? 'Splat! Oh no, there\'s another one.' : 'Splat! One more. You can hear it.'
  setTimeout(respawn, 700)
}

function respawn() {
  dead.value = false
  audio?.buzz(true)
  const w = area.value!.clientWidth
  gsap.set(bug.value!, { x: Math.random() < 0.5 ? -MOSQUITO : w, y: rand(0, 200), opacity: 1, scale: 1 })
  fly()
}

onMounted(() => {
  gsap.set(bug.value!, { x: 20, y: 20 })
  audio = createMosquitoAudio()
  audio.resume()
  gsap.ticker.add(tick)
  fly()
})

onBeforeUnmount(() => {
  gsap.ticker.remove(tick)
  audio?.dispose()
  flight?.kill()
  gsap.killTweensOf(fly)
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-3">
      <span class="chip bg-sun">🦟 {{ kills }} / {{ NEEDED }} squashed</span>
      <button
        type="button"
        class="icon-btn"
        :aria-label="muted ? 'Unmute' : 'Mute'"
        :title="muted ? 'Unmute' : 'Mute'"
        @click="toggleMute"
      >
        <span :class="muted ? 'i-carbon-volume-mute' : 'i-carbon-volume-up'" class="block text-lg" />
      </button>
    </div>

    <div
      ref="area"
      class="wall stage h-72 cursor-none select-none touch-none"
      @pointermove="moveSwatter"
      @pointerenter="hovering = true"
      @pointerleave="hovering = false"
      @pointerdown="moveSwatter($event); swat($event)"
    >
      <!-- a picture frame and a lamp, so it feels like a room -->
      <div class="absolute left-[8%] top-6 w-20 h-14 rounded border-3 border-ink bg-sky/60 shadow-[3px_3px_0_0_#16130f] pointer-events-none" aria-hidden="true">
        <div class="absolute inset-x-0 bottom-0 h-1/2 bg-mint/70 [clip-path:polygon(0_100%,30%_20%,55%_70%,75%_35%,100%_100%)]" />
      </div>
      <div class="absolute right-[10%] bottom-0 flex flex-col items-center pointer-events-none" aria-hidden="true">
        <div class="w-14 h-10 rounded-t-[50%] border-3 border-ink bg-sun" />
        <div class="w-1.5 h-16 bg-ink" />
        <div class="w-10 h-2 rounded-full bg-ink" />
      </div>

      <!-- splats left behind on the wall -->
      <span
        v-for="s in splats"
        :key="s.id"
        class="absolute text-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80"
        :style="{ left: `${s.x}px`, top: `${s.y}px` }"
      >💥</span>

      <div
        ref="bug"
        class="absolute left-0 top-0 leading-none pointer-events-none"
        :style="{ fontSize: `${MOSQUITO}px`, width: `${MOSQUITO}px`, height: `${MOSQUITO}px` }"
      >
        <span class="block animate-[buzz_0.08s_linear_infinite]">🦟</span>
      </div>

      <!-- fly swatter: the mesh head is centred on the pointer -->
      <div
        ref="swatter"
        class="absolute left-0 top-0 pointer-events-none"
        :class="hovering ? 'opacity-100' : 'opacity-0'"
      >
        <svg
          width="70"
          height="150"
          viewBox="0 0 70 150"
          class="block -ml-[35px] -mt-[35px] origin-[35px_145px]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="mesh" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M0 0H6V6" fill="none" stroke="#16130f" stroke-width="1.1" />
            </pattern>
          </defs>
          <rect x="31" y="62" width="8" height="86" rx="4" fill="#ff6b5b" stroke="#16130f" stroke-width="2" />
          <rect x="5" y="5" width="60" height="60" rx="10" fill="#7cb8ff" opacity="0.9" />
          <rect x="5" y="5" width="60" height="60" rx="10" fill="url(#mesh)" stroke="#16130f" stroke-width="3" />
        </svg>
      </div>
    </div>

    <p :class="kills >= NEEDED ? 'note-ok' : 'note'" role="status">{{ message }}</p>
  </div>
</template>

<style scoped>
.wall {
  background:
    repeating-linear-gradient(90deg, transparent 0 46px, rgb(22 19 15 / 0.05) 46px 48px),
    linear-gradient(#fff3c9, #ffe7a3);
}

@keyframes buzz {
  0% { transform: translate(0, 0); }
  25% { transform: translate(1px, -1px); }
  50% { transform: translate(-1px, 1px); }
  75% { transform: translate(1px, 1px); }
  100% { transform: translate(0, 0); }
}
</style>

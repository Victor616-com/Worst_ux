<script setup lang="ts">
import { gsap } from 'gsap'

const emit = defineEmits<{ pass: [] }>()

type Victim = { kind: 'person', shirt?: string } | { kind: 'emoji', e: string }
interface Group { label: string, legs: number, victims: Victim[] }
interface Dilemma { a: Group, b: Group }

const people = (n: number, shirt?: string): Victim[] => Array.from({ length: n }, () => ({ kind: 'person', shirt }))
const five = (label: string): Group => ({ label, legs: 10, victims: people(5) })
const one = (label: string): Group => ({ label, legs: 2, victims: people(1, '#f2c94c') })

// `a` is the main track (do nothing), `b` the other one (pull the lever).
// The lone person switches sides so you can't just always pull.
const DILEMMAS: Dilemma[] = [
  { a: five('5 people who comment "first"'), b: one('1 person who comments "who\'s watching in 2026?"') },
  { a: one('One person who leaves a single square on the roll'), b: five('Five people who never replace the toilet paper') },
  { a: five('Five people who reply “k”'), b: one('One person who texts “We need to talk” and disappears for six hours') },
  { a: one('One person who coughs without covering their mouth'), b: five('Five people who stop in the middle of a sidewalk') },
]
const DURATION = 7

// ---- track geometry (viewBox 500 × 400, isometric slope 0.45) -----------
type P = [number, number]
const SLOPE = 0.45
const J: P = [200, 150]
const MAIN: P[] = [[-200, J[1] - 440 * SLOPE], J]
const BRANCH = {
  a: [J, [250, J[1] + 50 * SLOPE], [560, 195]] as P[],
  b: [J, [250, J[1] + 50 * SLOPE + 4], [520, 395]] as P[],
}
const pathFor = (t: 'a' | 'b') => [...MAIN, ...BRANCH[t].slice(1)]
const pts = (p: P[]) => p.map(q => q.join(',')).join(' ')

function lengthTo(path: P[], i: number) {
  let s = 0
  for (let k = 1; k <= i; k++) s += Math.hypot(path[k]![0] - path[k - 1]![0], path[k]![1] - path[k - 1]![1])
  return s
}
function at(path: P[], s: number): P {
  for (let k = 1; k < path.length; k++) {
    const [x0, y0] = path[k - 1]!
    const [x1, y1] = path[k]!
    const len = Math.hypot(x1 - x0, y1 - y0)
    if (s <= len || k === path.length - 1) return [x0 + (x1 - x0) * s / len, y0 + (y1 - y0) * s / len]
    s -= len
  }
  return path[0]!
}
/** arc length at which the path reaches x (x lies on the last segment) */
function sAtX(path: P[], x: number) {
  const k = path.length - 1
  const [x0, y0] = path[k - 1]!
  const [x1, y1] = path[k]!
  return lengthTo(path, k - 1) + Math.hypot(x1 - x0, y1 - y0) * (x - x0) / (x1 - x0)
}

const TRAM_ARC = 100 * Math.hypot(1, SLOPE)
const TRAM_H = 36
const S_JUNCTION = lengthTo(pathFor('a'), 1)
const S_START = S_JUNCTION - 95 * Math.hypot(1, SLOPE)

// victims spread along the far part of each branch
// rotation that lays a person across the last segment of a branch
function acrossAngle(t: 'a' | 'b') {
  const path = BRANCH[t]
  const [x0, y0] = path[path.length - 2]!
  const [x1, y1] = path[path.length - 1]!
  return Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI - 60
}

function victimSpots(t: 'a' | 'b', n: number): P[] {
  const [x0, x1] = t === 'a' ? [330, 470] : [405, 470]
  const path = BRANCH[t]
  const last = path[path.length - 1]!
  const prev = path[path.length - 2]!
  const yAt = (x: number) => prev[1] + (x - prev[0]) * (last[1] - prev[1]) / (last[0] - prev[0])
  return Array.from({ length: n }, (_, i) => {
    const x = n === 1 ? (x0 + x1) / 2 : x0 + i * (x1 - x0) / (n - 1)
    return [x, yAt(x)]
  })
}

// ---- state ---------------------------------------------------------------
const round = ref(0)
const track = ref<'a' | 'b'>('a')
const remaining = ref(DURATION)
const result = ref<'' | 'right' | 'wrong'>('')
const message = ref('')
const front = ref(S_START)
const hit = ref<'' | 'a' | 'b'>('')

const dilemma = computed(() => DILEMMAS[round.value]!)
const spots = computed(() => ({
  a: victimSpots('a', dilemma.value.a.victims.length),
  b: victimSpots('b', dilemma.value.b.victims.length),
}))

// tram: rear and front both ride the chosen path, so it "turns" at the junction
const tram = computed(() => {
  const path = pathFor(track.value)
  const f = at(path, front.value)
  const r = at(path, front.value - TRAM_ARC)
  const w = f[0] - r[0]
  const angle = Math.atan2(f[1] - r[1], w) * 180 / Math.PI
  return { w, transform: `translate(${r[0]} ${r[1] - TRAM_H + 3}) skewY(${angle})` }
})

let tween: gsap.core.Tween | undefined
let later: ReturnType<typeof setTimeout> | undefined

function start() {
  track.value = 'a'
  result.value = ''
  message.value = ''
  hit.value = ''
  remaining.value = DURATION
  front.value = S_START
  const p = { s: S_START }
  tween = gsap.to(p, {
    s: S_JUNCTION,
    duration: DURATION,
    ease: 'none',
    onUpdate() {
      front.value = p.s
      remaining.value = Math.ceil(DURATION * (1 - this.progress()))
    },
    onComplete: roll,
  })
}

// past the junction: the choice is locked in
function roll() {
  const t = track.value
  const firstX = spots.value[t][0]![0] - 6
  const p = { s: front.value }
  tween = gsap.to(p, {
    s: sAtX(pathFor(t), firstX) + 34,
    duration: 0.9,
    ease: 'power1.in',
    onUpdate: () => (front.value = p.s),
    onComplete: judge,
  })
}

function judge() {
  const { a, b } = dilemma.value
  const chosen = track.value === 'a' ? a : b
  const other = track.value === 'a' ? b : a
  hit.value = track.value
  if (chosen.legs < other.legs) {
    result.value = 'right'
    const last = round.value === DILEMMAS.length - 1
    message.value = last ? 'Correct. Ethically sound.' : 'Correct. Fewest legs.\nNext dilemma.'
    later = setTimeout(() => {
      if (last) return emit('pass')
      round.value++
      nextTick(start)
    }, 1600)
  }
  else {
    result.value = 'wrong'
    message.value = `Wrong. You ran over ${chosen.legs} legs to save ${other.legs}.\nStarting over.`
    later = setTimeout(() => {
      round.value = 0
      nextTick(start)
    }, 2800)
  }
}

function pull() {
  if (result.value || remaining.value <= 0) return
  track.value = track.value === 'a' ? 'b' : 'a'
}

onMounted(() => {
  start()
})
onBeforeUnmount(() => {
  tween?.kill()
  clearTimeout(later)
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="trolley relative w-full aspect-[5/4] overflow-hidden select-none bg-[#d1d1d1] w95-sunken p-0!">
      <svg viewBox="0 0 500 400" class="absolute inset-0 w-full h-full" aria-hidden="true">
        <!-- tracks: a thick dark stroke with a grey one on top reads as two rails -->
        <g fill="none" stroke-linejoin="round">
          <polyline :points="pts(BRANCH[track === 'a' ? 'b' : 'a'])" stroke="#7a7a7a" stroke-width="9" />
          <polyline :points="pts(BRANCH[track === 'a' ? 'b' : 'a'])" stroke="#d1d1d1" stroke-width="5" />
          <polyline :points="pts(MAIN)" stroke="#1a1a1a" stroke-width="9" />
          <polyline :points="pts(MAIN)" stroke="#d1d1d1" stroke-width="5" />
          <polyline :points="pts(BRANCH[track])" stroke="#1a1a1a" stroke-width="9" />
          <polyline :points="pts(BRANCH[track])" stroke="#d1d1d1" stroke-width="5" />
        </g>

        <!-- bystander and lever -->
        <g :transform="`translate(${J[0] + 20} ${J[1] - 50})`">
          <ellipse cx="0" cy="26" rx="7" ry="3" fill="#1a1a1a" />
          <g
            class="lever"
            :style="{ transform: `rotate(${track === 'a' ? -28 : 28}deg)` }"
          >
            <line x1="0" y1="26" x2="0" y2="2" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round" />
            <circle cx="0" cy="2" r="3" fill="#1a1a1a" />
          </g>
          <!-- person -->
          <g transform="translate(24 -16)">
            <circle cx="0" cy="0" r="4" fill="#d9a77e" />
            <path d="M-3 -3.5q3-3 6 0" fill="#3a2a1e" />
            <rect x="-4.5" y="4.5" width="9" height="15" rx="2" fill="#f4f4f4" stroke="#9a9a9a" stroke-width=".6" />
            <rect x="-4" y="19" width="3.5" height="17" fill="#3d5f8f" />
            <rect x=".5" y="19" width="3.5" height="17" fill="#35547f" />
            <rect x="-4.5" y="36" width="4" height="2" fill="#222" />
            <rect x=".5" y="36" width="4" height="2" fill="#222" />
          </g>
        </g>

        <!-- victims -->
        <g v-for="t in (['a', 'b'] as const)" :key="t" :class="{ squashed: hit === t }">
          <template v-for="(v, i) in dilemma[t].victims" :key="`${round}${t}${i}`">
            <g v-if="v.kind === 'person'" :transform="`translate(${spots[t][i]![0]} ${spots[t][i]![1]}) rotate(${acrossAngle(t)})`">
              <rect x="0" y="-3" width="15" height="6" rx="1.5" fill="#3d5f8f" />
              <rect x="15" y="-3" width="3" height="6" fill="#222" />
              <rect
                x="-11" y="-3.5" width="12" height="7" rx="2"
                :fill="v.shirt === 'mime' ? '#fff' : (v.shirt ?? '#f4f4f4')"
                stroke="#9a9a9a" stroke-width=".6"
              />
              <template v-if="v.shirt === 'mime'">
                <rect v-for="k in 3" :key="k" :x="-10 + k * 3" y="-3.5" width="1.4" height="7" fill="#222" />
              </template>
              <circle cx="-14.5" cy="0" r="3.6" :fill="v.shirt === 'mime' ? '#fafafa' : '#d9a77e'" stroke="#9a9a9a" stroke-width=".4" />
            </g>
            <text
              v-else
              :x="spots[t][i]![0]"
              :y="spots[t][i]![1] - 2"
              text-anchor="middle"
              dominant-baseline="middle"
              :style="{ fontSize: '17px' }"
            >{{ v.e }}</text>
          </template>
        </g>

        <!-- tram -->
        <g :transform="tram.transform">
          <!-- roof -->
          <polygon :points="`0,0 ${tram.w},0 ${tram.w + 11},-11 11,-11`" fill="#f2efe8" stroke="#6b6b6b" stroke-width=".6" />
          <!-- front end -->
          <polygon :points="`${tram.w},0 ${tram.w + 11},-11 ${tram.w + 11},${TRAM_H - 11} ${tram.w},${TRAM_H}`" fill="#9b1c22" />
          <polygon :points="`${tram.w + 2},6 ${tram.w + 9},-1 ${tram.w + 9},10 ${tram.w + 2},17`" fill="#f6d77f" stroke="#5a1010" stroke-width=".6" />
          <!-- side -->
          <rect x="0" y="0" :width="tram.w" :height="TRAM_H" fill="#c3262d" />
          <rect x="0" y="0" :width="tram.w" height="3" fill="#8f1a1f" />
          <rect
            v-for="k in Math.max(0, Math.floor((tram.w - 14) / 11))"
            :key="k"
            :x="4 + (k - 1) * 11" y="6" width="8" height="12"
            fill="#f6d77f" stroke="#5a1010" stroke-width=".8"
          />
          <rect x="0" y="22" :width="tram.w" height="2" fill="#e6b54b" />
          <rect x="0" :y="TRAM_H - 7" :width="tram.w" height="7" fill="#5e1114" />
          <text x="5" y="30" fill="#f6d77f" :style="{ fontSize: '5px', fontFamily: 'Arial' }">CAPTCHA</text>
        </g>
      </svg>

      <!-- lever hit area -->
      <button
        type="button"
        class="absolute left-[39%] top-[22%] w-[10%] aspect-square rounded-full cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-black"
        :disabled="!!result"
        :aria-label="`Pull the lever. Trolley is heading for the ${track === 'a' ? 'main' : 'other'} track`"
        @click="pull"
      >
        <span v-if="!result && round === 0 && remaining > DURATION - 3" class="hint">pull me</span>
      </button>

      <!-- slide counter + timer -->
      <span class="pill right-3 top-3">{{ round + 1 }}/{{ DILEMMAS.length }}</span>
      <span class="pill left-3 top-3 tabular-nums" :class="{ 'bg-[#c3262d]!': remaining <= 2 && !result }">{{ remaining }}s</span>


      <!-- option A: next to the main track -->
      <p class="label absolute left-[57%] right-[4%] top-[14%]">{{ dilemma.a.label }}</p>

      <!-- option B (or the verdict): boxed, bottom-left -->
      <div class="absolute left-[3.7%] top-[68.5%] w-[62%] h-[27%] flex items-center px-[5%]" role="status">
        <p v-if="message" class="label">
          <span v-for="(l, i) in message.split('\n')" :key="i" class="block" :class="result === 'wrong' && i === 0 ? 'text-[#b3121c]' : result === 'right' && i === 0 ? 'text-[#1d7a2a]' : ''">{{ l }}</span>
        </p>
        <p v-else class="label">{{ dilemma.b.label }}</p>
      </div>
    </div>

    <p class="text-[10px] leading-tight text-[#404040]">
      Under CAPTCHA Ethics Policy §4.2(b), this CAPTCHA follows Leg Utilitarianism:
      always run over the fewest legs. Doing nothing still counts as a choice.
    </p>
  </div>
</template>

<style scoped>
.trolley {
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  container-type: inline-size;
}
.label {
  color: #111;
  font-size: clamp(11px, 3.2cqw, 19px);
  line-height: 1.28;
  letter-spacing: 0.005em;
}
.pill {
  position: absolute;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgb(80 80 80 / 0.75);
  color: #fff;
  font-size: 11px;
}
.lever {
  transform-box: view-box;
  transform-origin: 0 26px;
  transition: transform 0.18s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.squashed {
  opacity: 0.35;
  transition: opacity 0.3s;
}
.hint {
  position: absolute;
  left: 50%;
  bottom: 100%;
  translate: -50% 0;
  padding: 1px 6px;
  border-radius: 4px;
  background: #111;
  color: #fff;
  font-size: 10px;
  white-space: nowrap;
  animation: bob 0.8s ease-in-out infinite alternate;
}
@keyframes bob {
  to { translate: -50% -4px; }
}
</style>

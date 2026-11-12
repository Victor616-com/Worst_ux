<script setup lang="ts">
import { gsap } from 'gsap'

const emit = defineEmits<{ pass: [] }>()

interface Group { emoji: string, label: string, legs: number }
interface Dilemma { a: Group, b: Group, wrong: string }

const DILEMMAS: Dilemma[] = [
  {
    a: { emoji: '🧍🧍🧍🧍🧍', label: '5 tourists', legs: 10 },
    b: { emoji: '🧍', label: '1 mime', legs: 2 },
    wrong: 'Wrong. 10 legs is more than 2 legs.',
  },
  {
    a: { emoji: '🕷️', label: 'Doug (spider)', legs: 8 },
    b: { emoji: '🧍🧍🧍', label: '3 philosophers', legs: 6 },
    wrong: 'Wrong. Doug has 8 legs. The philosophers only have 6 between them.',
  },
  {
    a: { emoji: '🐙🐙🐙🐙', label: '4 octopuses', legs: 0 },
    b: { emoji: '🦆', label: '1 duck', legs: 2 },
    wrong: 'Wrong. Octopuses have arms, not legs. Everyone knows that.',
  },
  {
    a: { emoji: '🐎🐎🐎🐎🐎', label: '5 horses', legs: 20 },
    b: { emoji: '🐛', label: 'Gerald (centipede, 42 legs)', legs: 42 },
    wrong: 'Wrong. Gerald has 42 legs. 5 horses only have 20.',
  },
]
const DURATION = 7

const round = ref(0)
const track = ref<'a' | 'b'>('a')
const remaining = ref(DURATION)
const result = ref<'' | 'right' | 'wrong'>('')
const message = ref('')
const trolley = ref<SVGTextElement>()

const dilemma = computed(() => DILEMMAS[round.value]!)
let tl: gsap.core.Timeline | undefined

function start() {
  track.value = 'a'
  result.value = ''
  message.value = ''
  remaining.value = DURATION
  gsap.set(trolley.value!, { attr: { x: 10, y: 85 } })

  tl = gsap.timeline()
  tl.to(trolley.value!, {
    attr: { x: 150 },
    duration: DURATION,
    ease: 'none',
    onUpdate() { remaining.value = Math.ceil(DURATION * (1 - this.progress())) },
  })
  tl.add(() => {
    // past the junction: the choice is locked in
    const end = track.value === 'a' ? { x: 300, y: 55 } : { x: 300, y: 115 }
    gsap.to(trolley.value!, { attr: end, duration: 0.6, ease: 'power2.in', onComplete: judge })
  })
}

function judge() {
  const { a, b, wrong } = dilemma.value
  const chosen = track.value === 'a' ? a : b
  const other = track.value === 'a' ? b : a
  if (chosen.legs < other.legs) {
    result.value = 'right'
    message.value = round.value === DILEMMAS.length - 1 ? 'Ethically sound.' : 'Correct. Next dilemma.'
    setTimeout(() => {
      if (round.value === DILEMMAS.length - 1) return emit('pass')
      round.value++
      nextTick(start)
    }, 1400)
  }
  else {
    result.value = 'wrong'
    message.value = `${wrong} Starting over.`
    setTimeout(() => {
      round.value = 0
      nextTick(start)
    }, 2600)
  }
}

function pull() {
  if (result.value || remaining.value <= 0) return
  track.value = track.value === 'a' ? 'b' : 'a'
}

onMounted(start)
onBeforeUnmount(() => {
  tl?.kill()
  gsap.killTweensOf(trolley.value!)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <span class="chip bg-sky">⚖️ Dilemma {{ round + 1 }} / {{ DILEMMAS.length }}</span>
      <span class="chip font-mono" :class="remaining <= 2 && !result ? 'bg-tomato' : ''">
        ⏱ {{ remaining }}s to junction
      </span>
    </div>

    <div class="stage bg-[#eaf4ff]">
      <svg viewBox="0 0 400 170" class="block w-full" role="img" :aria-label="`Top track: ${dilemma.a.label}. Bottom track: ${dilemma.b.label}.`">
        <!-- ground -->
        <rect x="0" y="0" width="400" height="170" fill="#eaf4ff" />
        <!-- selected route glow -->
        <line x1="0" y1="85" x2="150" y2="85" stroke="#ffd23f" stroke-width="14" stroke-linecap="round" />
        <line
          x1="150" y1="85" :x2="400" :y2="track === 'a' ? 35 : 135"
          stroke="#ffd23f" stroke-width="14" stroke-linecap="round"
        />
        <!-- rails with sleepers -->
        <g stroke="#16130f" fill="none">
          <line x1="0" y1="85" x2="150" y2="85" stroke-width="10" stroke-dasharray="2 8" />
          <line x1="150" y1="85" x2="400" y2="35" stroke-width="10" stroke-dasharray="2 8" />
          <line x1="150" y1="85" x2="400" y2="135" stroke-width="10" stroke-dasharray="2 8" />
          <line x1="0" y1="85" x2="150" y2="85" stroke-width="3" />
          <line x1="150" y1="85" x2="400" y2="35" stroke-width="3" />
          <line x1="150" y1="85" x2="400" y2="135" stroke-width="3" />
        </g>
        <!-- lever at the junction -->
        <g :transform="`translate(150 108) rotate(${track === 'a' ? -25 : 25})`">
          <line x1="0" y1="0" x2="0" y2="-16" stroke="#16130f" stroke-width="3" stroke-linecap="round" />
          <circle cx="0" cy="-17" r="4" fill="#ff6b5b" stroke="#16130f" stroke-width="2" />
        </g>
        <rect x="142" y="106" width="16" height="6" rx="2" fill="#16130f" />

        <!-- victims with label tags -->
        <g>
          <rect x="268" y="12" width="124" height="16" rx="8" fill="#fff" stroke="#16130f" stroke-width="2" />
          <text x="330" y="23" font-size="9" font-weight="700" fill="#16130f" text-anchor="middle">{{ dilemma.a.label }}</text>
          <text x="330" y="52" font-size="16" text-anchor="middle" dominant-baseline="middle">{{ dilemma.a.emoji }}</text>
        </g>
        <g>
          <rect x="268" y="142" width="124" height="16" rx="8" fill="#fff" stroke="#16130f" stroke-width="2" />
          <text x="330" y="153" font-size="9" font-weight="700" fill="#16130f" text-anchor="middle">{{ dilemma.b.label }}</text>
          <text x="330" y="119" font-size="16" text-anchor="middle" dominant-baseline="middle">{{ dilemma.b.emoji }}</text>
        </g>

        <text ref="trolley" x="10" y="85" font-size="26" text-anchor="middle" dominant-baseline="middle">🚋</text>
      </svg>
    </div>

    <div class="flex items-center justify-between gap-4">
      <p class="text-sm">
        Heading for the
        <b class="px-1.5 py-0.5 rounded bg-sun border-2 border-ink">{{ track === 'a' ? 'top' : 'bottom' }}</b>
        track
      </p>
      <button type="button" class="btn bg-sky!" :disabled="!!result" @click="pull">
        <span class="i-carbon-arrows-vertical" /> Pull lever
      </button>
    </div>

    <p v-if="message" :class="result === 'right' ? 'note-ok' : 'note-bad'" role="status">
      {{ message }}
    </p>

    <p class="text-[9px] leading-tight text-muted/70">
      Under CAPTCHA Ethics Policy §4.2(b), this CAPTCHA follows Leg Utilitarianism:
      always run over the fewest legs. Doing nothing still counts as a choice.
    </p>
  </div>
</template>

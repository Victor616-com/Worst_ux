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
    <div class="flex justify-between text-sm">
      <span class="text-neutral-300">Dilemma {{ round + 1 }} of {{ DILEMMAS.length }}</span>
      <span class="font-mono" :class="remaining <= 2 ? 'text-red-400' : 'text-neutral-500'">
        {{ remaining }}s until junction
      </span>
    </div>

    <svg viewBox="0 0 400 170" class="w-full rounded-xl bg-neutral-950 border border-neutral-800">
      <line x1="0" y1="85" x2="150" y2="85" stroke="#525252" stroke-width="4" />
      <line
        x1="150" y1="85" x2="400" y2="35" stroke-width="4"
        :stroke="track === 'a' ? '#a78bfa' : '#404040'"
      />
      <line
        x1="150" y1="85" x2="400" y2="135" stroke-width="4"
        :stroke="track === 'b' ? '#a78bfa' : '#404040'"
      />

      <text x="330" y="51" font-size="16" text-anchor="middle" dominant-baseline="middle">{{ dilemma.a.emoji }}</text>
      <text x="330" y="28" font-size="9" fill="#a3a3a3" text-anchor="middle">{{ dilemma.a.label }}</text>
      <text x="330" y="119" font-size="16" text-anchor="middle" dominant-baseline="middle">{{ dilemma.b.emoji }}</text>
      <text x="330" y="148" font-size="9" fill="#a3a3a3" text-anchor="middle">{{ dilemma.b.label }}</text>

      <text ref="trolley" x="10" y="85" font-size="24" text-anchor="middle" dominant-baseline="middle">🚋</text>
    </svg>

    <div class="flex items-center justify-between gap-4">
      <span class="text-sm text-neutral-400">
        Heading for: <b class="text-neutral-100">{{ track === 'a' ? 'top track' : 'bottom track' }}</b>
      </span>
      <button type="button" class="btn" :disabled="!!result" @click="pull">
        Pull lever
      </button>
    </div>

    <p
      v-if="message"
      class="text-sm"
      :class="result === 'right' ? 'text-green-400' : 'text-red-400'"
      role="status"
    >
      {{ message }}
    </p>

    <p class="text-[9px] leading-tight text-neutral-600">
      Under CAPTCHA Ethics Policy §4.2(b), this CAPTCHA follows Leg Utilitarianism:
      always run over the fewest legs. Doing nothing still counts as a choice.
    </p>
  </div>
</template>

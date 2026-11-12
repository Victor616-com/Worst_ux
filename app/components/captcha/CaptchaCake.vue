<script setup lang="ts">
import { gsap } from 'gsap'
import ITEMS from './cake-items.json'

const emit = defineEmits<{ pass: [] }>()

type Answer = 'real' | 'cake'
const ROUNDS = 8
const MAX_MISTAKES = 1
const SECONDS = 5

const queue = ref<typeof ITEMS>([])
const round = ref(0)
const mistakes = ref(0)
const roundId = ref(0) // restarts the timer bar animation
const remaining = ref(SECONDS)
const reveal = ref<{ correct: boolean, text: string } | null>(null)
const photo = ref<HTMLElement>()

const item = computed(() => queue.value[round.value]!)
let timer: ReturnType<typeof setInterval> | undefined

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function startGame() {
  queue.value = shuffle(ITEMS).slice(0, ROUNDS)
  round.value = 0
  mistakes.value = 0
  startRound()
}

function startRound() {
  roundId.value++
  reveal.value = null
  remaining.value = SECONDS
  clearInterval(timer)
  timer = setInterval(() => {
    if (--remaining.value <= 0) answer(null)
  }, 1000)
  nextTick(() => {
    if (photo.value) gsap.fromTo(photo.value, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3 })
  })
}

function answer(choice: Answer | null) {
  if (reveal.value) return
  clearInterval(timer)

  const correct = choice === item.value.answer
  if (!correct) mistakes.value++
  reveal.value = {
    correct,
    text: choice === null ? `Too slow. ${item.value.reveal}` : item.value.reveal,
  }

  setTimeout(() => {
    if (mistakes.value > MAX_MISTAKES) {
      reveal.value = { correct: false, text: 'Too many mistakes. Your taste buds are not to be trusted. Starting over.' }
      return setTimeout(startGame, 2000)
    }
    if (round.value === ROUNDS - 1) return emit('pass')
    round.value++
    startRound()
  }, 1600)
}

onMounted(startGame)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div v-if="item" class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-3">
      <span class="chip bg-bubble">📸 {{ round + 1 }} / {{ ROUNDS }}</span>
      <span class="chip" :class="mistakes ? 'bg-tomato' : ''">
        {{ mistakes }} / {{ MAX_MISTAKES }} mistake{{ MAX_MISTAKES === 1 ? '' : 's' }} allowed
      </span>
    </div>

    <!-- polaroid -->
    <figure ref="photo" class="mx-auto w-full max-w-sm bg-white border-3 border-ink rounded-lg p-2.5 pb-3 shadow-[5px_5px_0_0_#16130f] -rotate-1">
      <div class="relative h-64 rounded bg-paper overflow-hidden center border-2 border-ink">
        <img :src="item.src" alt="Is this real or cake?" class="w-full h-full object-cover" draggable="false">
        <div
          v-if="reveal"
          class="absolute inset-x-2 bottom-2 rounded-lg border-2 border-ink px-3 py-2 text-sm font-bold"
          :class="reveal.correct ? 'bg-mint' : 'bg-tomato'"
          role="status"
        >
          {{ reveal.correct ? '✓' : '✗' }} {{ reveal.text }}
        </div>
      </div>
      <!-- timer drains along the bottom of the polaroid -->
      <div class="mt-2.5 h-2 rounded-full border-2 border-ink bg-paper overflow-hidden">
        <div
          :key="roundId"
          class="timer h-full bg-ink"
          :style="{ animationDuration: `${SECONDS}s`, animationPlayState: reveal ? 'paused' : 'running' }"
        />
      </div>
      <figcaption class="mt-1.5 text-[10px] text-muted truncate">
        Photo: <a :href="item.credit.url" target="_blank" rel="noopener" class="underline hover:text-ink">{{ item.credit.author }}</a>, {{ item.credit.license }}, Wikimedia Commons
      </figcaption>
    </figure>

    <div class="grid grid-cols-2 gap-3">
      <button type="button" class="btn bg-white! py-3 text-lg" :disabled="!!reveal" @click="answer('real')">
        🧱 Real
      </button>
      <button type="button" class="btn bg-bubble! py-3 text-lg" :disabled="!!reveal" @click="answer('cake')">
        🎂 Cake
      </button>
    </div>
  </div>
</template>

<style scoped>
.timer {
  animation-name: drain;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes drain {
  from { width: 100%; }
  to { width: 0%; }
}
</style>

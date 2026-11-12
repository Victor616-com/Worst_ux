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
  <div v-if="item" class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <span>Photo {{ round + 1 }} of {{ ROUNDS }}</span>
      <span class="flex gap-1 text-sm tabular-nums">
        <span class="w95-well px-2 py-0.5">Mistakes: {{ mistakes }}/{{ MAX_MISTAKES }}</span>
        <span class="w95-well px-2 py-0.5" :class="remaining <= 2 ? 'text-[var(--w95-bad)]' : ''">{{ remaining }}s</span>
      </span>
    </div>

    <div ref="photo" class="w95-sunken relative overflow-hidden bg-black! h-72 center">
      <img :src="item.src" alt="Is this real or cake?" class="max-h-full max-w-full object-contain" draggable="false">
      <div
        v-if="reveal"
        class="w95-raised absolute inset-x-3 bottom-3 p-0.75"
        role="status"
      >
        <div class="w95-titlebar text-xs" :style="reveal.correct ? undefined : { background: 'linear-gradient(90deg, #800000, #d04010)' }">
          {{ reveal.correct ? 'Correct' : 'Error' }}
        </div>
        <div class="flex items-center gap-2.5 p-2 text-sm">
          <Win95Icon :name="reveal.correct ? 'info' : 'warning'" :size="24" />
          <span>{{ reveal.text }}</span>
        </div>
      </div>
    </div>

    <p class="text-[10px] text-[#404040] truncate">
      Photo: <a :href="item.credit.url" target="_blank" rel="noopener" class="underline">{{ item.credit.author }}</a>, {{ item.credit.license }}, via Wikimedia Commons
    </p>

    <div class="grid grid-cols-2 gap-3">
      <button type="button" class="w95-btn h-9" :disabled="!!reveal" @click="answer('real')">Real</button>
      <button type="button" class="w95-btn h-9" :disabled="!!reveal" @click="answer('cake')">🎂 Cake</button>
    </div>
  </div>
</template>

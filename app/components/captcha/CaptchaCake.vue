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
    <div class="flex justify-between text-sm">
      <span class="text-neutral-300">Photo {{ round + 1 }} of {{ ROUNDS }}</span>
      <span class="font-mono text-neutral-500">
        mistakes {{ mistakes }}/{{ MAX_MISTAKES }} ·
        <span :class="remaining <= 2 ? 'text-red-400' : ''">{{ remaining }}s</span>
      </span>
    </div>

    <div ref="photo" class="relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 h-72 center">
      <img :src="item.src" alt="Is this real or cake?" class="max-h-full max-w-full object-contain" draggable="false">
      <div
        v-if="reveal"
        class="absolute inset-x-0 bottom-0 p-3 text-sm font-medium backdrop-blur"
        :class="reveal.correct ? 'bg-green-600/80' : 'bg-red-600/80'"
        role="status"
      >
        {{ reveal.correct ? '✓' : '✗' }} {{ reveal.text }}
      </div>
    </div>

    <p class="text-[10px] text-neutral-600 truncate">
      Photo: <a :href="item.credit.url" target="_blank" rel="noopener" class="underline">{{ item.credit.author }}</a>, {{ item.credit.license }}, via Wikimedia Commons
    </p>

    <div class="grid grid-cols-2 gap-3">
      <button type="button" class="btn bg-neutral-700!" :disabled="!!reveal" @click="answer('real')">Real</button>
      <button type="button" class="btn bg-pink-600!" :disabled="!!reveal" @click="answer('cake')">🎂 Cake</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const emit = defineEmits<{ pass: [] }>()

const CORRECT = 'I don\'t know, I can\'t speak Chinese'
const OPTIONS = [
  CORRECT,
  'Lion doesn\'t concern himself with opinions of a sheep',
  'Sorry mom.',
  'Love',
]
const WRONG = [
  'Wrong. That\'s what the tattoo artist told him it said.',
  'Wrong. He believed that too, for about six years.',
  'Wrong. Look closer. It says it twice, sort of.',
]

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)

const options = ref(shuffle(OPTIONS))
const picked = ref('')
const reveal = ref<{ correct: boolean, text: string } | null>(null)
const tries = ref(0)
const list = ref<HTMLElement>()

function answer(option: string) {
  if (reveal.value) return
  picked.value = option
  if (option === CORRECT) {
    reveal.value = { correct: true, text: 'Correct. 我不知道，我不會說中國話.' }
    setTimeout(() => emit('pass'), 1600)
    return
  }
  reveal.value = { correct: false, text: WRONG[tries.value++ % WRONG.length]! }
  setTimeout(() => {
    reveal.value = null
    picked.value = ''
    options.value = shuffle(OPTIONS)
    nextTick(() => {
      if (list.value) gsap.from(list.value.children, { opacity: 0, y: 6, duration: 0.2, stagger: 0.05 })
    })
  }, 1800)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <span>What does the tattoo say?</span>
      <span class="w95-well px-2 py-0.5 text-sm tabular-nums">Attempts: {{ tries }}</span>
    </div>

    <div class="w95-sunken relative overflow-hidden bg-black! h-72 center">
      <img src="/tattoo/tattoo.jpg" alt="Arm tattoo with a vertical line of Chinese characters" class="max-h-full max-w-full object-contain" draggable="false">
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

    <div ref="list" class="grid sm:grid-cols-2 gap-2">
      <button
        v-for="o in options"
        :key="o"
        type="button"
        class="w95-btn min-h-11 text-left leading-tight"
        :class="{ 'is-pressed': picked === o }"
        :disabled="!!reveal"
        @click="answer(o)"
      >
        {{ o }}
      </button>
    </div>
  </div>
</template>

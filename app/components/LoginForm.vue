<script setup lang="ts">
import { gsap } from 'gsap'

const username = ref('')
const password = ref('')
const verified = ref(false)
const captchaOpen = ref(false)
const error = ref('')
const success = ref(false)

const form = ref<HTMLFormElement>()
const successBox = ref<HTMLElement>()

function shake() {
  gsap.fromTo(form.value!, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.25)' })
}

function openCaptcha() {
  if (!verified.value) captchaOpen.value = true
}

function onCaptchaDone() {
  captchaOpen.value = false
  verified.value = true
  error.value = ''
}

function submit() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = 'Please fill in your username and password.'
    return shake()
  }
  if (!verified.value) {
    error.value = 'Please prove you\'re not a robot.'
    return shake()
  }
  success.value = true
}

watch(successBox, (el) => {
  if (!el) return
  gsap.from(el.children, { y: 20, opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' })
})

function reset() {
  username.value = password.value = ''
  verified.value = false
  success.value = false
}
</script>

<template>
  <div class="w-full max-w-sm p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl">
    <div v-if="success" ref="successBox" class="flex flex-col items-center text-center gap-4 py-6">
      <div class="i-carbon-checkmark-filled text-6xl text-green-500" />
      <h2 class="text-2xl font-bold">Login successful</h2>
      <p class="text-neutral-400">Welcome, {{ username }}. You've proven you're human. Eventually.</p>
      <button class="btn" @click="reset">Log out</button>
    </div>

    <form v-else ref="form" class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <h2 class="text-2xl font-bold mb-2">Log in</h2>

      <label class="flex flex-col gap-1 text-sm">
        Username
        <input v-model="username" class="field" autocomplete="username">
      </label>

      <label class="flex flex-col gap-1 text-sm">
        Password
        <input v-model="password" type="password" class="field" autocomplete="current-password">
      </label>

      <button
        type="button"
        class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-left cursor-pointer hover:border-neutral-500 transition"
        :aria-pressed="verified"
        @click="openCaptcha"
      >
        <span
          class="w-6 h-6 rounded border-2 center shrink-0"
          :class="verified ? 'border-green-500 bg-green-500/20' : 'border-neutral-500 bg-neutral-900'"
        >
          <span v-if="verified" class="i-carbon-checkmark text-green-400" />
        </span>
        <span class="flex-1">I'm not a robot</span>
        <span class="i-carbon-security text-neutral-500" />
      </button>

      <p v-if="error" class="text-sm text-red-400" role="alert">{{ error }}</p>

      <button type="submit" class="btn mt-2">Log in</button>
    </form>

    <WorstCaptcha v-if="captchaOpen" @done="onCaptchaDone" @cancel="captchaOpen = false" />
  </div>
</template>

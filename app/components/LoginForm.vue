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
  <div class="card w-full p-7 sm:p-8">
    <div v-if="success" ref="successBox" class="flex flex-col items-center text-center gap-4 py-4">
      <div class="w-20 h-20 center rounded-full bg-mint border-3 border-ink shadow-[4px_4px_0_0_#16130f]">
        <span class="i-carbon-checkmark text-4xl" />
      </div>
      <h2 class="heading text-3xl">You're in!</h2>
      <p class="text-muted">
        Welcome, <b class="text-ink">{{ username }}</b>. You've proven you're human. Eventually.
      </p>
      <button class="btn" @click="reset">
        <span class="i-carbon-logout" /> Log out
      </button>
    </div>

    <form v-else ref="form" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <div>
        <h2 class="heading text-3xl">Log in</h2>
        <p class="text-sm text-muted mt-1">Just a couple of quick checks.</p>
      </div>

      <label class="flex flex-col gap-1.5 text-sm font-bold">
        Username
        <input v-model="username" class="field font-normal" autocomplete="username" placeholder="human_person_42">
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-bold">
        Password
        <input v-model="password" type="password" class="field font-normal" autocomplete="current-password" placeholder="••••••••">
      </label>

      <!-- the infamous checkbox -->
      <button
        type="button"
        class="group flex items-center gap-3 p-3.5 rounded-xl border-2 border-ink text-left cursor-pointer transition-all"
        :class="verified ? 'bg-mint' : 'bg-paper hover:(bg-sun/40 -translate-y-px shadow-[3px_3px_0_0_#16130f])'"
        :aria-pressed="verified"
        @click="openCaptcha"
      >
        <span class="w-7 h-7 shrink-0 center rounded-md border-2 border-ink bg-white">
          <span v-if="verified" class="i-carbon-checkmark text-lg" />
        </span>
        <span class="flex-1 font-bold">{{ verified ? 'Verified human' : 'I\'m not a robot' }}</span>
        <span class="flex flex-col items-center text-[9px] font-bold uppercase leading-none text-muted">
          <span class="i-carbon-bot text-xl mb-0.5 text-ink" />
          worst<br>CAPTCHA
        </span>
      </button>

      <p v-if="error" class="note-bad" role="alert">{{ error }}</p>

      <button type="submit" class="btn w-full py-3 text-lg">
        Log in <span class="i-carbon-arrow-right" />
      </button>
    </form>

    <WorstCaptcha v-if="captchaOpen" @done="onCaptchaDone" @cancel="captchaOpen = false" />
  </div>
</template>

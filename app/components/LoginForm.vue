<script setup lang="ts">
import { gsap } from 'gsap'

const username = ref('')
const password = ref('')
const verified = ref(false)
const captchaOpen = ref(false)
const error = ref('')
const success = ref(false)

const win = ref<HTMLElement>()

function shake() {
  gsap.fromTo(win.value!, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
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
    error.value = 'Please type a user name and password.'
    return shake()
  }
  if (!verified.value) {
    error.value = 'Please prove you\'re not a robot.'
    return shake()
  }
  success.value = true
}

function cancel() {
  error.value = 'Cancel is not supported. You must log on.'
  shake()
}

function reset() {
  username.value = password.value = ''
  verified.value = false
  success.value = false
}

onMounted(() => {
  gsap.from(win.value!, { y: 30, opacity: 0, scale: 0.96, duration: 0.3, ease: 'power2.out' })
})
</script>

<template>
  <div
    ref="win"
    class="w95-raised w95-window w-full max-w-md"
    role="dialog"
    aria-labelledby="logon-title"
  >
    <header class="w95-titlebar">
      <Win95Icon :name="success ? 'info' : 'lock'" :size="16" />
      <h2 id="logon-title" class="flex-1 min-w-0 truncate text-sm">
        {{ success ? 'Worst UX' : 'Log On to Worst UX' }}
      </h2>
      <button type="button" class="w95-btn w95-titlebtn" aria-label="Help" title="Help" @click="shake">?</button>
      <button type="button" class="w95-btn w95-titlebtn" aria-label="Close" title="Close" @click="success ? reset() : cancel()">✕</button>
    </header>

    <!-- success message box -->
    <div v-if="success" class="flex flex-col gap-4 p-4">
      <div class="flex items-start gap-4">
        <Win95Icon name="info" :size="40" class="shrink-0" />
        <div class="flex flex-col gap-2 pt-1">
          <p class="font-bold">You have logged on successfully.</p>
          <p>Welcome, {{ username }}. You've proven you're human. Eventually.</p>
        </div>
      </div>
      <div class="flex justify-center">
        <button type="button" class="w95-btn" @click="reset">Log Off</button>
      </div>
    </div>

    <!-- logon form -->
    <form v-else class="flex gap-4 p-4" novalidate @submit.prevent="submit">
      <div class="hidden sm:block shrink-0 pt-1">
        <Win95Icon name="lock" :size="40" />
      </div>

      <div class="flex-1 min-w-0 flex flex-col gap-3">
        <p>Type a user name and password to log on to Worst UX.</p>

        <label class="grid grid-cols-[6.5rem_1fr] items-center gap-2">
          <span><u>U</u>ser name:</span>
          <input v-model="username" class="w95-sunken w95-field" autocomplete="username" accesskey="u">
        </label>

        <label class="grid grid-cols-[6.5rem_1fr] items-center gap-2">
          <span><u>P</u>assword:</span>
          <input v-model="password" type="password" class="w95-sunken w95-field" autocomplete="current-password" accesskey="p">
        </label>

        <fieldset class="w95-group mt-1">
          <legend>Security</legend>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              class="w95-checkbox"
              :checked="verified"
              @click.prevent="openCaptcha"
            >
            <span class="flex-1">I'm not a robot</span>
            <Win95Icon name="warning" :size="16" />
          </label>
          <p class="mt-1.5 pl-5 text-xs text-[#404040]">
            {{ verified ? 'Verified by CAPTCHA.EXE.' : 'Requires CAPTCHA.EXE (6 quick steps).' }}
          </p>
        </fieldset>

        <p v-if="error" class="flex items-center gap-2 text-[var(--w95-bad)]" role="alert">
          <Win95Icon name="warning" :size="16" class="shrink-0" />
          {{ error }}
        </p>

        <!-- stacked buttons on the right, like the original dialog -->
        <div class="flex justify-end gap-2 sm:hidden">
          <button type="submit" class="w95-btn font-bold">OK</button>
          <button type="button" class="w95-btn" @click="cancel">Cancel</button>
        </div>
      </div>

      <div class="hidden sm:flex shrink-0 flex-col gap-2">
        <button type="submit" class="w95-btn font-bold outline-1 outline-black outline-offset-0">OK</button>
        <button type="button" class="w95-btn" @click="cancel">Cancel</button>
      </div>
    </form>

    <WorstCaptcha v-if="captchaOpen" @done="onCaptchaDone" @cancel="captchaOpen = false" />
  </div>
</template>

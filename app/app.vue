<script setup lang="ts">
import { gsap } from 'gsap'

const root = ref<HTMLElement>()

useGsap(root, () => {
  gsap.from('.intro > *', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' })
  gsap.from('.sticker', { scale: 0, rotate: -40, duration: 0.6, delay: 0.5, ease: 'back.out(2)' })
})
</script>

<template>
  <div ref="root" class="paper-bg min-h-screen font-sans text-ink center px-4 py-16">
    <NuxtRouteAnnouncer />

    <main class="intro w-full max-w-md flex flex-col items-center gap-8">
      <header class="relative text-center flex flex-col items-center gap-3">
        <span class="chip bg-sun">
          <span class="i-carbon-warning-alt text-sm" /> Security level: excessive
        </span>
        <h1 class="heading text-5xl sm:text-6xl leading-none">
          Worst&nbsp;<span class="relative inline-block px-2 -rotate-2 bg-bubble border-3 border-ink rounded-xl shadow-[4px_4px_0_0_#16130f]">UX</span>
        </h1>
        <p class="text-muted max-w-xs">
          The login page that really, <em>really</em> wants to know you're human.
        </p>
        <span
          class="sticker absolute -right-6 -top-4 sm:-right-14 w-16 h-16 center rounded-full bg-mint border-3 border-ink text-[10px] font-bold uppercase leading-tight text-center rotate-12 shadow-[3px_3px_0_0_#16130f]"
          aria-hidden="true"
        >6 easy<br>steps!</span>
      </header>

      <LoginForm />

      <p class="text-xs text-muted">No data is sent anywhere. Not that you'll get that far.</p>
    </main>
  </div>
</template>

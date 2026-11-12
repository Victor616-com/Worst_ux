<script setup lang="ts">
import { gsap } from 'gsap'

const root = ref<HTMLElement>()

useGsap(root, () => {
  gsap.from('.intro > *', { y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' })
})
</script>

<template>
  <div ref="root" class="min-h-screen bg-neutral-950 text-neutral-100 font-sans center flex-col gap-8 px-4">
    <NuxtRouteAnnouncer />
    <div class="intro w-full center flex-col gap-8">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight">Worst UX</h1>
      <LoginForm />
    </div>
  </div>
</template>

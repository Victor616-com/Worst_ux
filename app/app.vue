<script setup lang="ts">
const DESKTOP_ICONS = [
  { icon: 'computer', label: 'My Computer' },
  { icon: 'recycle', label: 'Recycle Bin' },
  { icon: 'folder', label: 'Worst UX' },
  { icon: 'document', label: 'passwords.txt' },
] as const

const clock = ref('')
let clockTimer: ReturnType<typeof setInterval> | undefined
function tickClock() {
  clock.value = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

onMounted(() => {
  tickClock()
  clockTimer = setInterval(tickClock, 10_000)
})
onBeforeUnmount(() => clearInterval(clockTimer))
</script>

<template>
  <div class="win95 min-h-dvh flex flex-col" style="background: var(--w95-desktop)">
    <NuxtRouteAnnouncer />

    <!-- desktop icons -->
    <ul class="absolute top-4 left-3 hidden sm:flex flex-col gap-5 select-none" aria-hidden="true">
      <li v-for="d in DESKTOP_ICONS" :key="d.label" class="w-20 flex flex-col items-center gap-1">
        <Win95Icon :name="d.icon" />
        <span class="w95-iconlabel w-full [overflow-wrap:anywhere]">{{ d.label }}</span>
      </li>
    </ul>

    <main class="flex-1 center p-3 sm:p-6">
      <LoginForm />
    </main>

    <!-- taskbar -->
    <nav class="w95-raised sticky bottom-0 shrink-0 flex items-center gap-1 h-9 px-1 select-none" aria-label="Taskbar">
      <span class="w95-btn flex items-center gap-1.5 min-w-0! px-2! font-bold cursor-default">
        <Win95Icon name="computer" :size="18" />
        Start
      </span>
      <span class="w-px self-stretch my-1 bg-[#808080] shadow-[1px_0_#fff] mx-1" />
      <span class="w95-btn is-pressed flex items-center gap-1.5 min-w-0 max-w-48 truncate text-sm cursor-default">
        <Win95Icon name="lock" :size="16" />
        <span class="truncate">Log On</span>
      </span>
      <span class="w95-well ml-auto flex items-center gap-2 h-7 px-2 text-sm tabular-nums">
        <Win95Icon name="warning" :size="16" />
        {{ clock }}
      </span>
    </nav>
  </div>
</template>

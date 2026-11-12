<script setup lang="ts">
const emit = defineEmits<{ pass: [] }>()

// Exactly one suspect lies, and the liar is the killer.
// Checking each candidate gives exactly one liar only when it is Penny.
// The weapon is the only one that is blunt, crumb-free and contains no metal.
const SUSPECTS = [
  { id: 'mabel', emoji: '👩‍⚕️', name: 'Dr. Mabel Finch', role: 'the family doctor', says: 'Rex is innocent.' },
  { id: 'rex', emoji: '🧑‍🌾', name: 'Rex Holloway', role: 'the gardener', says: 'Penny did it.' },
  { id: 'penny', emoji: '🧹', name: 'Penny Vale', role: 'the maid', says: 'Dr. Finch did it.' },
  { id: 'colonel', emoji: '🎖️', name: 'Colonel Burke', role: 'retired, loud', says: 'Penny is lying.' },
  { id: 'gus', emoji: '🤵', name: 'Gus', role: 'the butler', says: 'Dr. Finch is telling the truth.' },
]
const WEAPONS = ['Cactus', 'Baguette', 'Stapler', 'Trombone', 'Rubber duck']
const WEAPON_ICONS: Record<string, string> = { 'Cactus': '🌵', 'Baguette': '🥖', 'Stapler': '📎', 'Trombone': '🎺', 'Rubber duck': '🦆' }
const KILLER = 'penny'
const WEAPON = 'Rubber duck'
const LOCKOUT = 10

const suspect = ref('')
const weapon = ref('')
const message = ref('')
const locked = ref(0)
let lockTimer: ReturnType<typeof setInterval> | undefined

function accuse() {
  if (locked.value) return
  if (!suspect.value || !weapon.value) {
    message.value = 'A detective must name a suspect AND a weapon.'
    return
  }
  if (suspect.value === KILLER && weapon.value === WEAPON) {
    message.value = 'Case closed. You are clearly human (robots can\'t solve murders).'
    setTimeout(() => emit('pass'), 1200)
    return
  }
  message.value = suspect.value === 'gus'
    ? 'It was never the butler. Detective licence suspended.'
    : 'Wrong. The real killer has fled the country. Detective licence suspended.'
  suspect.value = ''
  weapon.value = ''
  locked.value = LOCKOUT
  lockTimer = setInterval(() => {
    if (--locked.value <= 0) clearInterval(lockTimer)
  }, 1000)
}

onBeforeUnmount(() => clearInterval(lockTimer))
</script>

<template>
  <div class="flex flex-col gap-5 text-sm">
    <!-- case file -->
    <section class="relative stage bg-[#f6e7c8] p-4 pt-5 leading-relaxed">
      <span class="absolute -top-px right-4 px-2 py-0.5 rounded-b-md border-2 border-t-0 border-ink bg-tomato text-[10px] font-bold uppercase tracking-wider">Confidential</span>
      <p class="eyebrow mb-1">Case file #0042</p>
      <h4 class="heading text-xl mb-2">The Death of Lord Quill</h4>
      <p>
        Lord Quill was found in the study at 9:12 PM, struck on the head. Five people were in the house.
        Interrogations revealed one thing for certain:
      </p>
      <p class="mt-2 font-bold bg-sun inline px-1 box-decoration-clone">Exactly one suspect is lying, and the liar is the killer.</p>
    </section>

    <!-- suspects (also the "who" picker) -->
    <section>
      <p class="eyebrow mb-2">Statements · pick the killer</p>
      <div class="grid gap-2" role="radiogroup" aria-label="Who did it?">
        <button
          v-for="s in SUSPECTS"
          :key="s.id"
          type="button"
          role="radio"
          :aria-checked="suspect === s.id"
          class="flex items-center gap-3 p-2.5 rounded-xl border-2 border-ink text-left cursor-pointer transition-all"
          :class="suspect === s.id ? 'bg-tomato shadow-[3px_3px_0_0_#16130f] -translate-y-px' : 'bg-white hover:bg-paper'"
          @click="suspect = s.id"
        >
          <span class="w-10 h-10 shrink-0 center rounded-lg border-2 border-ink bg-paper text-xl">{{ s.emoji }}</span>
          <span class="flex-1 min-w-0">
            <span class="block font-bold">{{ s.name }} <span class="font-normal text-ink/60">· {{ s.role }}</span></span>
            <span class="block italic">“{{ s.says }}”</span>
          </span>
        </button>
      </div>
    </section>

    <!-- forensics -->
    <section class="stage bg-white p-4">
      <p class="eyebrow mb-2">🧪 Forensics report</p>
      <ul class="flex flex-col gap-1.5">
        <li class="flex gap-2"><span>•</span> The wound was blunt, not prickly.</li>
        <li class="flex gap-2"><span>•</span> No crumbs were found at the scene.</li>
        <li class="flex gap-2"><span>•</span> A metal detector swept the study. Nothing beeped.</li>
        <li class="flex gap-2"><span>•</span> Gus's apron is covered in red stains. (He made spaghetti.)</li>
      </ul>
    </section>

    <!-- weapon picker -->
    <section>
      <p class="eyebrow mb-2">Pick the weapon</p>
      <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="With what?">
        <button
          v-for="w in WEAPONS"
          :key="w"
          type="button"
          role="radio"
          :aria-checked="weapon === w"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-ink font-bold cursor-pointer transition-all"
          :class="weapon === w ? 'bg-tomato shadow-[2px_2px_0_0_#16130f] -translate-y-px' : 'bg-white hover:bg-paper'"
          @click="weapon = w"
        >
          <span>{{ WEAPON_ICONS[w] }}</span> {{ w }}
        </button>
      </div>
    </section>

    <p v-if="message" :class="message.startsWith('Case closed') ? 'note-ok' : 'note-bad'" role="status">
      {{ message }}
    </p>

    <button type="button" class="btn bg-tomato! self-start" :disabled="locked > 0" @click="accuse">
      <span class="i-carbon-search" />
      {{ locked ? `Licence suspended (${locked}s)` : 'Make accusation' }}
    </button>
  </div>
</template>

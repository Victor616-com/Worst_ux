<script setup lang="ts">
const emit = defineEmits<{ pass: [] }>()

// Exactly one suspect lies, and the liar is the killer.
// Checking each candidate gives exactly one liar only when it is Penny.
// The weapon is the only one that is blunt, crumb-free and contains no metal.
const SUSPECTS = [
  { id: 'mabel', name: 'Dr. Mabel Finch', role: 'the family doctor', says: 'Rex is innocent.' },
  { id: 'rex', name: 'Rex Holloway', role: 'the gardener', says: 'Penny did it.' },
  { id: 'penny', name: 'Penny Vale', role: 'the maid', says: 'Dr. Finch did it.' },
  { id: 'colonel', name: 'Colonel Burke', role: 'retired, loud', says: 'Penny is lying.' },
  { id: 'gus', name: 'Gus', role: 'the butler', says: 'Dr. Finch is telling the truth.' },
]
const WEAPONS = ['Cactus', 'Baguette', 'Stapler', 'Trombone', 'Rubber duck']
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
  <div class="flex flex-col gap-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
    <div class="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-100/90 leading-relaxed">
      <p class="font-semibold mb-1">Case file #0042: The Death of Lord Quill</p>
      Lord Quill was found in the study at 9:12 PM, struck on the head. Five people were in the house.
      Interrogations revealed one thing for certain:
      <b>exactly one suspect is lying, and the liar is the killer.</b>
    </div>

    <div>
      <p class="font-semibold mb-2">Statements</p>
      <ul class="flex flex-col gap-1.5">
        <li v-for="s in SUSPECTS" :key="s.id" class="text-neutral-300">
          <b class="text-neutral-100">{{ s.name }}</b>
          <span class="text-neutral-500"> ({{ s.role }})</span>: “{{ s.says }}”
        </li>
      </ul>
    </div>

    <div>
      <p class="font-semibold mb-2">Forensics</p>
      <ul class="list-disc pl-5 flex flex-col gap-1 text-neutral-300">
        <li>The wound was blunt, not prickly.</li>
        <li>No crumbs were found at the scene.</li>
        <li>A metal detector swept the study. Nothing beeped.</li>
        <li>Gus's apron is covered in red stains. (He made spaghetti.)</li>
      </ul>
    </div>

    <fieldset class="flex flex-col gap-1.5">
      <legend class="font-semibold mb-2">Who did it?</legend>
      <label v-for="s in SUSPECTS" :key="s.id" class="flex items-center gap-2 cursor-pointer">
        <input v-model="suspect" type="radio" name="suspect" :value="s.id" class="accent-[#6d28d9]">
        {{ s.name }}
      </label>
    </fieldset>

    <fieldset class="flex flex-col gap-1.5">
      <legend class="font-semibold mb-2">With what?</legend>
      <label v-for="w in WEAPONS" :key="w" class="flex items-center gap-2 cursor-pointer">
        <input v-model="weapon" type="radio" name="weapon" :value="w" class="accent-[#6d28d9]">
        {{ w }}
      </label>
    </fieldset>

    <p v-if="message" class="text-sm" :class="message.startsWith('Case closed') ? 'text-green-400' : 'text-red-400'" role="status">
      {{ message }}
    </p>

    <button type="button" class="btn self-start" :disabled="locked > 0" :class="{ 'opacity-50 cursor-not-allowed': locked > 0 }" @click="accuse">
      {{ locked ? `Suspended (${locked}s)` : 'Accuse' }}
    </button>
  </div>
</template>

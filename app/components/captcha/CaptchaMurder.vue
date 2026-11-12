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
  <div class="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1 w95-scroll">
    <div class="w95-sunken px-3! py-2.5! leading-relaxed font-mono text-sm">
      <p class="font-bold mb-1">CASE_0042.TXT - The Death of Lord Quill</p>
      Lord Quill was found in the study at 9:12 PM, struck on the head. Five people were in the house.
      Interrogations revealed one thing for certain:
      <b>exactly one suspect is lying, and the liar is the killer.</b>
    </div>

    <fieldset class="w95-group">
      <legend>Statements</legend>
      <ul class="flex flex-col gap-1.5">
        <li v-for="s in SUSPECTS" :key="s.id">
          <b>{{ s.name }}</b>
          <span class="text-[#505050]"> ({{ s.role }})</span>: “{{ s.says }}”
        </li>
      </ul>
    </fieldset>

    <fieldset class="w95-group">
      <legend>Forensics</legend>
      <ul class="list-disc pl-5 flex flex-col gap-1">
        <li>The wound was blunt, not prickly.</li>
        <li>No crumbs were found at the scene.</li>
        <li>A metal detector swept the study. Nothing beeped.</li>
        <li>Gus's apron is covered in red stains. (He made spaghetti.)</li>
      </ul>
    </fieldset>

    <div class="grid sm:grid-cols-2 gap-3">
    <fieldset class="w95-group flex flex-col gap-1.5">
      <legend>Who did it?</legend>
      <label v-for="s in SUSPECTS" :key="s.id" class="flex items-center gap-2 cursor-pointer">
        <input v-model="suspect" type="radio" name="suspect" :value="s.id" class="w95-radio">
        {{ s.name }}
      </label>
    </fieldset>

    <fieldset class="w95-group flex flex-col gap-1.5">
      <legend>With what?</legend>
      <label v-for="w in WEAPONS" :key="w" class="flex items-center gap-2 cursor-pointer">
        <input v-model="weapon" type="radio" name="weapon" :value="w" class="w95-radio">
        {{ w }}
      </label>
    </fieldset>
    </div>

    <p v-if="message" class="text-sm" :class="message.startsWith('Case closed') ? 'text-[var(--w95-ok)]' : 'text-[var(--w95-bad)]'" role="status">
      {{ message }}
    </p>

    <button type="button" class="w95-btn self-end h-9" :disabled="locked > 0" @click="accuse">
      {{ locked ? `Suspended (${locked}s)` : 'Accuse' }}
    </button>
  </div>
</template>

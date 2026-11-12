<script setup lang="ts">
import { gsap } from "gsap";
import CaptchaCake from "./captcha/CaptchaCake.vue";
import CaptchaMosquito from "./captcha/CaptchaMosquito.vue";
import CaptchaPiano from "./captcha/CaptchaPiano.vue";
import CaptchaTrolley from "./captcha/CaptchaTrolley.vue";
import CaptchaTorch from "./captcha/CaptchaTorch.vue";

const emit = defineEmits<{ done: []; cancel: [] }>();

const STEPS = [
  { title: "Swat the mosquito", component: CaptchaMosquito, progress: 1 },
  { title: "Play a song", component: CaptchaPiano, progress: 6 },
  { title: "Real or cake?", component: CaptchaCake, progress: 3 },
  { title: "Make an ethical decision", component: CaptchaTrolley, progress: 4 },
  { title: "Restore power", component: CaptchaTorch, progress: 2 },
];

const index = ref(0);
const phase = ref<"steps" | "verifying">("steps");
const verifyProgress = ref(0);
const verifyText = ref("Verifying humanity…");
const body = ref<HTMLElement>();
const card = ref<HTMLElement>();

const step = computed(() => STEPS[index.value]!);

let advancing = false;

async function next() {
  if (advancing) return;
  advancing = true;
  await gsap.to(body.value!, { opacity: 0, x: -30, duration: 0.25 });
  if (index.value < STEPS.length - 1) index.value++;
  else phase.value = "verifying";
  await nextTick();
  gsap.fromTo(
    body.value!,
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0, duration: 0.3 },
  );
  advancing = false;
  if (phase.value === "verifying") verify();
}

function verify() {
  const p = { v: 0 };
  gsap
    .timeline({ onComplete: () => emit("done") })
    .to(p, {
      v: 99,
      duration: 2.5,
      ease: "power2.out",
      onUpdate: () => (verifyProgress.value = Math.round(p.v)),
    })
    .call(
      () => (verifyText.value = "Hmm. Still not sure about you…"),
      [],
      "+=1.5",
    )
    .to(p, {
      v: 100,
      duration: 0.2,
      delay: 1.5,
      onUpdate: () => (verifyProgress.value = Math.round(p.v)),
    })
    .call(() => (verifyText.value = "Fine. You're human."))
    .to({}, { duration: 1 });
}

// min / max do nothing useful, they just wobble the window
function nope() {
  gsap.fromTo(card.value!, { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
}

const clock = ref("");
let clockTimer: ReturnType<typeof setInterval> | undefined;
function tickClock() {
  clock.value = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const DESKTOP_ICONS = [
  { icon: "computer", label: "My Computer" },
  { icon: "recycle", label: "Recycle Bin" },
  { icon: "folder", label: "Definitely Human" },
  { icon: "document", label: "not_a_robot.txt" },
] as const;

// cheat code: 7 skips whatever step you're on (top-row or numpad 7, any layout)
function onKeydown(e: KeyboardEvent) {
  const isSeven = e.key === "7" || e.code === "Digit7" || e.code === "Numpad7";
  if (!isSeven || e.repeat || phase.value !== "steps") return;
  e.preventDefault();
  e.stopImmediatePropagation();
  next();
}

onBeforeUnmount(() => {
  clearInterval(clockTimer);
  window.removeEventListener("keydown", onKeydown, true);
});

onMounted(() => {
  window.addEventListener("keydown", onKeydown, true);
  tickClock();
  clockTimer = setInterval(tickClock, 10_000);
  gsap.from(card.value!, {
    y: 40,
    opacity: 0,
    scale: 0.95,
    duration: 0.3,
    ease: "steps(4)",
  });
});
</script>

<template>
  <Teleport to="body">
    <div class="win95 fixed inset-0 z-50 flex flex-col" style="background: var(--w95-desktop)">
      <!-- desktop icons -->
      <ul class="absolute top-4 left-3 hidden sm:flex flex-col gap-5 pointer-events-none select-none">
        <li v-for="d in DESKTOP_ICONS" :key="d.label" class="w-20 flex flex-col items-center gap-1">
          <Win95Icon :name="d.icon" />
          <span class="w95-iconlabel w-full [overflow-wrap:anywhere]">{{ d.label }}</span>
        </li>
      </ul>

      <!-- the captcha window -->
      <div class="flex-1 min-h-0 center p-3 sm:p-6">
        <div
          ref="card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="captcha-title"
          class="w95-raised w95-window w-full max-w-xl max-h-full flex flex-col"
        >
          <header class="w95-titlebar">
            <Win95Icon name="lock" :size="16" />
            <h3 id="captcha-title" class="flex-1 min-w-0 truncate text-sm">
              CAPTCHA.EXE -
              {{ phase === "steps" ? step.title : "Verifying" }}
            </h3>
            <button type="button" class="w95-btn w95-titlebtn" aria-label="Minimize" title="Minimize" @click="nope">
              <span class="block w-1.5 h-0.5 bg-black mt-1.5" />
            </button>
            <button type="button" class="w95-btn w95-titlebtn" aria-label="Maximize" title="Maximize" @click="nope">
              <span class="block w-2 h-1.75 border border-black border-t-2" />
            </button>
            <button
              type="button"
              class="w95-btn w95-titlebtn ml-0.5"
              aria-label="Give up"
              title="Give up"
              @click="emit('cancel')"
            >
              ✕
            </button>
          </header>

          <!-- humanity meter -->
          <div v-if="phase === 'steps'" class="flex items-center gap-2 px-2 pt-2 text-sm">
            <span class="shrink-0">Humanity:</span>
            <div class="w95-sunken w95-progress flex-1">
              <span :style="{ width: `${step.progress}%` }" />
            </div>
            <span class="w-9 text-right tabular-nums">{{ step.progress }}%</span>
          </div>

          <div ref="body" class="p-3 min-h-0 overflow-y-auto w95-scroll">
            <component
              :is="step.component"
              v-if="phase === 'steps'"
              :key="index"
              @pass="next"
            />
            <div v-else class="flex items-start gap-4 py-4 px-1">
              <Win95Icon name="hourglass" :size="40" class="animate-[spin_2s_steps(8)_infinite]" />
              <div class="flex-1 flex flex-col gap-3">
                <p role="status">{{ verifyText }}</p>
                <div class="flex items-center gap-2">
                  <div class="w95-sunken w95-progress flex-1">
                    <span :style="{ width: `${verifyProgress}%`, transition: 'none' }" />
                  </div>
                  <span class="w-10 text-right tabular-nums">{{ verifyProgress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- status bar -->
          <footer class="flex gap-1 px-0.5 pt-0.5 text-xs">
            <span class="w95-well flex-1 px-1.5 py-0.5">
              {{ phase === "steps" ? `Step ${index + 1} of ${STEPS.length}` : "Almost there" }}
            </span>
            <span class="w95-well flex-1 px-1.5 py-0.5 truncate">
              Robot probability: {{ phase === "steps" ? 100 - step.progress : 1 }}%
            </span>
          </footer>
        </div>
      </div>

      <!-- taskbar -->
      <nav class="w95-raised shrink-0 flex items-center gap-1 h-9 px-1 select-none" aria-label="Taskbar">
        <button type="button" class="w95-btn flex items-center gap-1.5 min-w-0! px-2! font-bold" @click="nope">
          <Win95Icon name="computer" :size="18" />
          Start
        </button>
        <span class="w-px self-stretch my-1 bg-[#808080] shadow-[1px_0_#fff] mx-1" />
        <span class="w95-btn is-pressed flex items-center gap-1.5 min-w-0 max-w-48 truncate text-sm cursor-default">
          <Win95Icon name="lock" :size="16" />
          <span class="truncate">CAPTCHA.EXE</span>
        </span>
        <span class="w95-well ml-auto flex items-center gap-2 h-7 px-2 text-sm tabular-nums">
          <Win95Icon name="warning" :size="16" />
          {{ clock }}
        </span>
      </nav>
    </div>
  </Teleport>
</template>

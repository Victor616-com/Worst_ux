<script setup lang="ts">
import { gsap } from "gsap";
import CaptchaCake from "./captcha/CaptchaCake.vue";
import CaptchaMosquito from "./captcha/CaptchaMosquito.vue";
import CaptchaPiano from "./captcha/CaptchaPiano.vue";
import CaptchaTrolley from "./captcha/CaptchaTrolley.vue";
import CaptchaTorch from "./captcha/CaptchaTorch.vue";
import CaptchaMurder from "./captcha/CaptchaMurder.vue";

const emit = defineEmits<{ done: []; cancel: [] }>();

// accent = header colour, progress = the (deliberately useless) percentage shown
const STEPS = [
  { title: "Swat the mosquito", icon: "🦟", accent: "#ffd23f", component: CaptchaMosquito, progress: 1 },
  { title: "Play a song", icon: "🎹", accent: "#b69cff", component: CaptchaPiano, progress: 6 },
  { title: "Real or cake?", icon: "🎂", accent: "#ff8fc7", component: CaptchaCake, progress: 3 },
  { title: "Make an ethical decision", icon: "🚋", accent: "#7cb8ff", component: CaptchaTrolley, progress: 4 },
  { title: "Restore power", icon: "🔦", accent: "#ffa552", component: CaptchaTorch, progress: 2 },
  { title: "Solve the murder", icon: "🔍", accent: "#ff6b5b", component: CaptchaMurder, progress: 11 },
];

const index = ref(0);
const phase = ref<"steps" | "verifying">("steps");
const verifyProgress = ref(0);
const verifyText = ref("Verifying humanity…");
const body = ref<HTMLElement>();
const card = ref<HTMLElement>();

const step = computed(() => STEPS[index.value]!);

async function next() {
  await gsap.to(body.value!, { opacity: 0, x: -30, duration: 0.25 });
  if (index.value < STEPS.length - 1) index.value++;
  else phase.value = "verifying";
  await nextTick();
  gsap.fromTo(
    body.value!,
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0, duration: 0.3 },
  );
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

onMounted(() => {
  gsap.from(card.value!, {
    y: 40,
    opacity: 0,
    scale: 0.95,
    duration: 0.4,
    ease: "back.out(1.6)",
  });
});
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm center p-3 sm:p-6 text-ink font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="captcha-title"
    >
      <div
        ref="card"
        class="card w-full max-w-xl max-h-[calc(100dvh-1.5rem)] flex flex-col overflow-hidden"
      >
        <!-- header -->
        <header
          class="flex items-center gap-4 px-5 py-4 border-b-3 border-ink transition-colors duration-500"
          :style="{ background: phase === 'steps' ? step.accent : '#5ee6a8' }"
        >
          <div
            class="w-12 h-12 shrink-0 center rounded-xl border-2 border-ink bg-white text-2xl shadow-[2px_2px_0_0_#16130f]"
            aria-hidden="true"
          >
            {{ phase === "steps" ? step.icon : "🤖" }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="eyebrow text-ink/70">
              {{
                phase === "steps"
                  ? `Step ${index + 1} of ${STEPS.length}`
                  : "Almost there"
              }}
            </p>
            <h3 id="captcha-title" class="heading text-xl sm:text-2xl truncate">
              {{ phase === "steps" ? step.title : "Verifying" }}
            </h3>
          </div>
          <button
            type="button"
            class="icon-btn shrink-0"
            aria-label="Give up"
            title="Give up"
            @click="emit('cancel')"
          >
            <span class="i-carbon-close text-xl" />
          </button>
        </header>

        <!-- progress -->
        <div
          class="flex items-center gap-3 px-5 py-2.5 border-b-2 border-ink bg-paper"
        >
          <ol class="flex-1 flex gap-1.5" aria-label="Progress">
            <li
              v-for="(s, i) in STEPS"
              :key="s.title"
              class="flex-1 h-2.5 rounded-full border-2 border-ink transition-colors duration-500"
              :style="{
                background:
                  phase === 'verifying' || i < index
                    ? '#16130f'
                    : i === index
                      ? step.accent
                      : '#fff',
              }"
              :aria-current="i === index && phase === 'steps' ? 'step' : undefined"
            />
          </ol>
          <span class="chip">
            {{ phase === "steps" ? step.progress : 99 }}% done
          </span>
        </div>

        <!-- body -->
        <div ref="body" class="p-5 sm:p-6 overflow-y-auto">
          <component
            :is="step.component"
            v-if="phase === 'steps'"
            :key="index"
            @pass="next"
          />
          <div v-else class="flex flex-col gap-4 py-4">
            <p class="font-bold text-lg">{{ verifyText }}</p>
            <div
              class="stage h-6 rounded-full bg-white"
              role="progressbar"
              :aria-valuenow="verifyProgress"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                class="verify-bar h-full border-r-2 border-ink"
                :style="{ width: `${verifyProgress}%` }"
              />
            </div>
            <p class="text-right font-mono text-sm text-muted">
              {{ verifyProgress }}%
            </p>
          </div>
        </div>

        <footer
          class="flex items-center justify-between gap-3 px-5 py-2 border-t-2 border-ink bg-paper text-[11px] text-muted"
        >
          <span class="font-bold text-ink">worst CAPTCHA™</span>
          <span>Having trouble? That's the point.</span>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.verify-bar {
  background: repeating-linear-gradient(
    -45deg,
    #5ee6a8 0 12px,
    #3fcf8e 12px 24px
  );
  background-size: 34px 34px;
  animation: stripes 0.6s linear infinite;
}

@keyframes stripes {
  to {
    background-position: 34px 0;
  }
}
</style>

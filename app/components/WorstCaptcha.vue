<script setup lang="ts">
import { gsap } from "gsap";
import CaptchaCake from "./captcha/CaptchaCake.vue";
import CaptchaMosquito from "./captcha/CaptchaMosquito.vue";
import CaptchaPiano from "./captcha/CaptchaPiano.vue";
import CaptchaTrolley from "./captcha/CaptchaTrolley.vue";
import CaptchaTorch from "./captcha/CaptchaTorch.vue";
import CaptchaMurder from "./captcha/CaptchaMurder.vue";

const emit = defineEmits<{ done: []; cancel: [] }>();

const STEPS = [
  { title: "Swat the mosquito", component: CaptchaMosquito, progress: 1 },
  { title: "Play a song", component: CaptchaPiano, progress: 6 },
  { title: "Real or cake?", component: CaptchaCake, progress: 3 },
  { title: "Make an ethical decision", component: CaptchaTrolley, progress: 4 },
  { title: "Restore power", component: CaptchaTorch, progress: 2 },
  { title: "Solve the murder", component: CaptchaMurder, progress: 11 },
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
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm center p-4 text-neutral-100 font-sans"
    >
      <div
        ref="card"
        class="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden"
      >
        <header
          class="flex items-center justify-between gap-4 px-6 py-4 bg-brand"
        >
          <div>
            <p class="text-xs uppercase tracking-wider opacity-80">
              {{
                phase === "steps"
                  ? `Step ${index + 1} of ${STEPS.length}`
                  : "Almost there"
              }}
            </p>
            <h3 class="text-lg font-bold">
              {{ phase === "steps" ? step.title : "Verifying" }}
            </h3>
          </div>
          <button
            type="button"
            class="p-1 rounded hover:bg-white/20 cursor-pointer"
            aria-label="Give up"
            title="Give up"
            @click="emit('cancel')"
          >
            <div class="i-carbon-close text-xl" />
          </button>
        </header>

        <div v-if="phase === 'steps'" class="h-1 bg-neutral-800">
          <div
            class="h-full bg-green-500 transition-all duration-700"
            :style="{ width: `${step.progress}%` }"
          />
        </div>

        <div ref="body" class="p-6">
          <component
            :is="step.component"
            v-if="phase === 'steps'"
            :key="index"
            @pass="next"
          />
          <div v-else class="flex flex-col gap-3 py-6">
            <p class="text-neutral-300">{{ verifyText }}</p>
            <div class="h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                class="h-full bg-green-500"
                :style="{ width: `${verifyProgress}%` }"
              />
            </div>
            <p class="text-right font-mono text-sm text-neutral-500">
              {{ verifyProgress }}%
            </p>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

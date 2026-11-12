import { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * Run GSAP animations scoped to an element. Everything created inside `setup`
 * is automatically reverted when the component unmounts.
 */
export function useGsap(
  scope: Ref<HTMLElement | null | undefined>,
  setup: (ctx: gsap.Context) => void,
) {
  let ctx: gsap.Context | undefined

  onMounted(() => {
    ctx = gsap.context(setup, scope.value ?? undefined)
  })

  onBeforeUnmount(() => ctx?.revert())
}

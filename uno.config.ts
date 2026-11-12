import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

/*
 * Design language: playful neo-brutalism.
 * Cream paper, thick ink outlines, hard offset shadows, one bright accent per step.
 */
export default defineConfig({
  theme: {
    colors: {
      ink: '#16130f',
      paper: '#fff6e5',
      sun: '#ffd23f',
      bubble: '#ff8fc7',
      sky: '#7cb8ff',
      mint: '#5ee6a8',
      tomato: '#ff6b5b',
      grape: '#b69cff',
      tangerine: '#ffa552',
      muted: '#6b6257',
    },
  },
  shortcuts: {
    'center': 'flex items-center justify-center',

    // surfaces
    'card': 'bg-white border-3 border-ink rounded-2xl shadow-[6px_6px_0_0_#16130f]',
    'stage': 'relative rounded-xl border-2 border-ink overflow-hidden',
    'chip': 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border-2 border-ink bg-white text-xs font-bold text-ink whitespace-nowrap',

    // controls
    'btn': 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-ink bg-sun font-bold text-ink shadow-[3px_3px_0_0_#16130f] transition-all duration-100 cursor-pointer select-none hover:(-translate-x-0.5 -translate-y-0.5 shadow-[5px_5px_0_0_#16130f]) active:(translate-x-[3px] translate-y-[3px] shadow-none) disabled:(opacity-50 cursor-not-allowed translate-x-0 translate-y-0 shadow-[3px_3px_0_0_#16130f])',
    'btn-ghost': 'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-ink bg-white text-sm font-bold text-ink cursor-pointer transition hover:bg-sun disabled:(opacity-40 cursor-not-allowed hover:bg-white)',
    'icon-btn': 'w-9 h-9 center rounded-lg border-2 border-ink bg-white text-ink cursor-pointer transition hover:bg-sun',
    'field': 'w-full px-3.5 py-2.5 rounded-xl border-2 border-ink bg-white text-ink placeholder-muted/60 outline-none transition focus:(shadow-[3px_3px_0_0_#16130f] -translate-y-px)',

    // feedback line under each game
    'note': 'rounded-lg border-2 border-ink px-3 py-2 text-sm font-medium text-ink bg-white',
    'note-ok': 'note bg-mint',
    'note-bad': 'note bg-tomato',

    'heading': 'font-display font-extrabold tracking-tight text-ink',
    'eyebrow': 'text-[11px] font-bold uppercase tracking-[0.14em] text-muted',
  },
  presets: [
    presetWind4(),
    presetIcons({ scale: 1.2 }),
    presetTypography(),
    presetWebFonts({
      provider: 'bunny',
      fonts: {
        sans: 'Space Grotesk:400,500,700',
        display: 'Bricolage Grotesque:700,800',
        mono: 'JetBrains Mono:400,700',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})

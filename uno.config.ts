import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium bg-brand text-white hover:opacity-90 transition cursor-pointer',
    'center': 'flex items-center justify-center',
    'field': 'px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 outline-none focus:border-brand transition',
  },
  theme: {
    colors: {
      brand: '#6d28d9',
    },
  },
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({ scale: 1.2 }),
    presetTypography(),
    presetWebFonts({
      provider: 'bunny',
      fonts: { sans: 'Inter' },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})

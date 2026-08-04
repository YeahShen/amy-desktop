export default defineNuxtConfig({
  srcDir: 'src',
  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/color-mode', '@vueuse/nuxt', '@pinia/nuxt'],

  devServer: {
    port: Number(process.env.AMY_PORT),
  },

  css: ['~/assets/css/main.css', '~/assets/css/tailwind.css', '~/assets/css/themes.css'],

  ui: {
    fonts: false,
  },

  nitro: {
    compressPublicAssets: {
      gzip: false,
      brotli: true,
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.AMY_BASE_URL,
      model: process.env.AMY_MODE,
      ras: process.env.AMY_RAS_KEY,
    },
  },

  vite: {
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
  },

  colorMode: {
    preference: 'system',
    fallback: 'light', // fallback value if not system preference found
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storage: 'cookie', // or 'sessionStorage' or 'cookie'
    storageKey: '--amy-color-mode',
  },

  icon: {
    componentName: 'NuxtIcon',
    customCollections: [
      {
        prefix: 'custom',
        dir: 'src/assets/icons',
      },
    ],
  },
});

export default defineNuxtConfig({
  app: {
    head: {
      bodyAttrs: {
        style: 'font-family: PingFangSC;',
      },
    },
  },

  srcDir: 'src',
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', '@pinia/nuxt'],

  devServer: {
    port: Number(process.env.AMY_PORT),
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/tailwind.css',
    '~/assets/css/themes.css',
    '~/assets/css/fonts.css',
  ],

  ui: {
    fonts: false,
    colorMode: false,
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

  icon: {
    componentName: 'NuxtIcon',
    customCollections: [
      {
        prefix: 'amy',
        dir: 'src/assets/icons',
      },
    ],
  },
});

import tailwindcss from '@tailwindcss/vite';

const videoJsElements = new Set([
  'video-player',
  'video-skin',
  'mux-video',
  'hls-video',
  'hlsjs-video',
]);

export default defineNuxtConfig({
  app: {
    head: {
      bodyAttrs: {
        style: 'font-family: PingFangSC;',
      },
    },
    pageTransition: { name: 'fade', mode: 'out-in' },
  },

  modules: ['@nuxt/eslint', '@pinia/nuxt', '@nuxt/icon', '@antdv-next/nuxt'],

  srcDir: 'src',

  devServer: {
    port: Number(process.env.AMY_PORT),
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/tailwind.css',
    '~/assets/css/themes.css',
    '~/assets/css/fonts.css',
    '~/assets/css/antd.css',
    '~/assets/css/antd.dark.css',
  ],

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
    plugins: [tailwindcss()],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => videoJsElements.has(tag),
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

  antd: {
    icon: false,
  },
});

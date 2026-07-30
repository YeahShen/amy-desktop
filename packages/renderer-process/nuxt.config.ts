export default defineNuxtConfig({
  srcDir: 'src',
  modules: ['@nuxt/eslint'],

  devServer: {
    port: Number(process.env.AMY_PORT),
  },
});

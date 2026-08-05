<script setup lang="ts">
import type { User } from '@amy/shared';

definePageMeta({
  layout: 'empty',
  colorMode: 'light',
});

useHead({
  script: [
    {
      src: '/script/jsencrypt.min.js',
      async: true,
    },
  ],
});

const loading = ref(false);
const config = useRuntimeConfig();

const message = useMessage();

async function usernamePasswordLogin(
  username: string,
  password: string,
): Promise<{ user: User; token: string }> {
  loading.value = true;

  try {
    message.success('操作成功');

    return {
      user: {},
      token: '',
    };
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col login-wrap">
    <LoginHeader />

    <div class="flex w-full gap-x-2 justify-start text-2xl title mt-3 px-4">
      <span class="text-primary font-bold">Amy</span>
      <span class="font-bold">Station</span>
    </div>

    <div class="mt-6 w-full text-toned px-4">
      <span>账号登录</span>
    </div>

    <div class="mt-3 px-4">
      <LoginUsernamepassword :login-fn="usernamePasswordLogin" v-model:loading="loading" />
    </div>

    <div class="w-full flex items-center justify-center gap-x-2 absolute bottom-6">
      <UButton color="neutral" variant="ghost" size="xs">扫码登陆</UButton>
      <span class="text-muted">|</span>
      <UButton color="neutral" variant="ghost" size="xs">更多选项</UButton>
    </div>
  </div>
</template>

<style lang="scss">
.login-wrap {
  .title {
    font-family: Orbitron, sans-serif !important;
  }
}
</style>

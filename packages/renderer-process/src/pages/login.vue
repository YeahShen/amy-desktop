<script setup lang="tsx">
import type { User } from '@amy/shared';

definePageMeta({
  layout: 'empty',
  colorMode: 'dark',
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

// const message = useMessage();

function encryptPassword(pwd: string) {
  // @ts-ignore
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(config.public.ras); // 设置公钥
  // @ts-ignore
  return encryptor.encrypt(pwd); // 对需要加密的数据进行加密
}

async function usernamePasswordLogin(
  username: string,
  password: string,
): Promise<{ user: User; token: string }> {
  loading.value = true;

  try {
    const { token, user } = await $request<{ token: string; user: User }>(
      '/auth/login-by-username-password',
      {
        method: 'POST',
        body: {
          username,
          password: encryptPassword(password),
        },
      },
    );

    return {
      token,
      user,
    };
  } catch {
    loading.value = false;
    throw new Error();
  }
}
</script>

<template>
  <div class="w-full h-full flex flex-col login-wrap">
    <LoginHeader />

    <div class="flex w-full gap-x-2 justify-start text-2xl title mt-3 px-4">
      <span class="text-primary font-bold">Amy</span>
      <span class="font-bold text-inverted">Station</span>
    </div>

    <div class="mt-6 w-full text-toned px-4">
      <span>账号登录</span>
    </div>

    <div class="mt-3 px-4">
      <LoginUsernamepassword :login-fn="usernamePasswordLogin" />
    </div>

    <div class="w-full flex items-center justify-center gap-x-2 absolute bottom-4">
      <AButton type="text">扫码登陆</AButton>
      <span class="text-muted">|</span>
      <AButton type="text">更多选项</AButton>
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

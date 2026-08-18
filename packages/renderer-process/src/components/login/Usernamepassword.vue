<script setup lang="tsx">
import type { UserloggedCacheItem, User } from '@amy/shared';
import { useLocalStorage } from '@vueuse/core';

const props = defineProps<{
  loginFn: (username: string, password: string) => Promise<{ user: User; token: string }>;
}>();

const loginForm = ref({
  username: '',
  password: '',
});

const showPassword = ref(false);

const config = useRuntimeConfig();

const loading = defineModel<boolean>('loading', {
  default: false,
});

const autoLogin = useSettings('login.autoLogin');
const rememberPassword = useSettings('login.remenberMe');

watch(autoLogin, (v) => {
  if (v) rememberPassword.value = true;
});

watch(rememberPassword, (v) => {
  if (!v) autoLogin.value = false;
});

const userAccountCache = useLocalStorage<Record<string, UserloggedCacheItem>>(
  '__logged_account_cache',
  {},
);

const loggedUser = computed(() => {
  return Object.entries(userAccountCache.value)
    .map(([_key, value]) => value)
    .sort((a, b) => b.lastLoginDate - a.lastLoginDate);
});

async function login() {
  const { user, token } = await props.loginFn(loginForm.value.username, loginForm.value.password);

  userAccountCache.value[loginForm.value.username] = {
    account: loginForm.value.username,
    lastLoginDate: Date.now(),
  };

  if (rememberPassword.value) {
    userAccountCache.value[loginForm.value.username] = {
      lastLoginDate: Date.now(),
      account: loginForm.value.username,
      password: loginForm.value.password,
    };
  }

  if (config.public.model === 'development') {
    await $fetch(`/set-token?token=${token}`);
  }

  window.electronAPI.send('login', token, user);
}
</script>

<template>
  <div class="flex flex-col w-full"></div>
</template>

<style lang="scss"></style>

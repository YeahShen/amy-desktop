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

const options = computed(() => loggedUser.value.map((i) => ({ value: i.account })));

const showSearch = {
  filterOption: (inputValue: string, option?: { value?: string }) => {
    return (option?.value ?? '').toUpperCase().includes(inputValue.toUpperCase());
  },
};

function selectAccount(value: string) {
  const account = loggedUser.value.find((i) => i.account === value);

  if (account) {
    loginForm.value.password = account.password as string;
  }
}
</script>

<template>
  <a-form>
    <a-form-item
      name="username"
      :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-auto-complete
        v-model:value="loginForm.username"
        size="large"
        :show-search="showSearch"
        :options="options"
        @select="selectAccount"
      >
        <template #prefix>
          <NuxtIcon name="amy:user-outlined" size="20" />
        </template>
      </a-auto-complete>
    </a-form-item>

    <a-form-item
      name="password"
      :rules="[{ required: true, message: 'Please input your password!' }]"
    >
      <a-input-password v-model:value="loginForm.password" size="large">
        <template #prefix>
          <NuxtIcon name="amy:lock-outlined" size="20" />
        </template>
      </a-input-password>
    </a-form-item>

    <div class="w-full flex gap-x-4 mt-4">
      <a-checkbox v-model:checked="rememberPassword">
        <span class="text-default">记住密码</span>
      </a-checkbox>

      <a-checkbox v-model:checked="autoLogin">
        <span class="text-default">自动登录</span>
      </a-checkbox>
    </div>

    <div class="mt-7 w-full">
      <a-button type="primary" block size="large" :loading="loading" @click="login">
        登录
      </a-button>
    </div>
  </a-form>
</template>

<style lang="scss"></style>

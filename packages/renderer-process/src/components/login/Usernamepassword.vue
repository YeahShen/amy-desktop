<script setup lang="ts">
import type { UserloggedCacheItem, User } from '@amy/shared';

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
  <div class="flex flex-col w-full">
    <LoginUsernameInput
      v-model="loginForm.username"
      :logged-items="loggedUser"
      :disabled="loading"
      @set-password="(v) => (loginForm.password = v)"
    />

    <UInput
      v-model="loginForm.password"
      class="w-full mt-4"
      size="xl"
      :disabled="loading"
      :ui="{ trailing: 'pe-1' }"
      :type="showPassword ? 'text' : 'password'"
    >
      <template #leading>
        <UIcon name="amy:lock-outlined" class="size-5" />
      </template>

      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="showPassword ? 'amy:eye-off' : 'amy:eye'"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          :aria-pressed="showPassword"
          aria-controls="password"
          @click="showPassword = !showPassword"
        />
      </template>
    </UInput>

    <div class="w-full flex gap-x-4 mt-4">
      <UCheckbox v-model="autoLogin">
        <template #label>
          <span class="text-default">自动登录</span>
        </template>
      </UCheckbox>

      <UCheckbox v-model="rememberPassword">
        <template #label>
          <span class="text-default">记住密码</span>
        </template>
      </UCheckbox>
    </div>

    <UButton
      class="mt-7 w-full flex justify-center"
      loading-icon="i-lucide-loader"
      :loading
      size="xl"
      :ui="{}"
      @click="login"
      >登录</UButton
    >
  </div>
</template>

<style lang="scss"></style>

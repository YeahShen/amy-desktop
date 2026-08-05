<script setup lang="ts">
import type { UserloggedCacheItem } from '@amy/shared';

const loginForm = ref({
  username: '',
  password: '',
});

const showPassword = ref(false);
const loading = defineModel('loading', {
  default: false,
});

const config = useRuntimeConfig();

const userAccountCache = useLocalStorage<Record<string, UserloggedCacheItem>>(
  '__logged_account_cache',
  {},
);

const loggedUser = computed(() => {
  return Object.entries(userAccountCache.value)
    .map(([_key, value]) => value)
    .sort((a, b) => b.lastLoginDate - a.lastLoginDate);
});
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
        <UIcon name="i-ant-design:lock-outlined" class="size-5" />
      </template>

      <template #trailing>
        <UButton
          color="neutral"
          variant="link"
          size="sm"
          :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          :aria-pressed="showPassword"
          aria-controls="password"
          @click="showPassword = !showPassword"
        />
      </template>
    </UInput>

    <div class="w-full flex gap-x-4 mt-4">
      <UCheckbox>
        <template #label>
          <span class="text-default">自动登录</span>
        </template>
      </UCheckbox>

      <UCheckbox>
        <template #label>
          <span class="text-default">记住密码</span>
        </template>
      </UCheckbox>
    </div>

    <UButton
      class="mt-8 w-full flex justify-center"
      loading-icon="i-lucide-loader"
      :loading
      size="xl"
      :ui="{}"
      >登录</UButton
    >
  </div>
</template>

<style lang="scss"></style>

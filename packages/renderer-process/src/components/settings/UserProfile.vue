<script setup lang="ts">
import type { User } from '@amy/shared';

const userStore = useUserStore();
const message = useMessage();

const saving = ref(false);
/** 是否已从 store 完成首次回填；防止外部更新 info 时覆盖正在编辑的草稿 */
const hydrated = ref(false);

const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 可编辑资料草稿 */
const form = reactive<Pick<User, 'nickname' | 'phone' | 'email'>>({
  nickname: '',
  phone: '',
  email: '',
});

/** 用户资料异步到达时初始化草稿（仅首次回填） */
watch(
  () => userStore.info,
  (info) => {
    if (!info || hydrated.value) return;
    hydrated.value = true;
    syncForm(info);
  },
  { immediate: true },
);

function syncForm(source: Pick<User, 'nickname' | 'phone' | 'email'>) {
  form.nickname = source.nickname ?? '';
  form.phone = source.phone ?? '';
  form.email = source.email ?? '';
}

const displayName = computed(() => userStore.info?.nickname || userStore.info?.username || '—');

/** 草稿（保存时会 trim）与已保存资料是否有差异，决定保存/取消按钮可用性 */
const dirty = computed(
  () =>
    form.nickname?.trim() !== (userStore.info?.nickname ?? '').trim() ||
    form.phone?.trim() !== (userStore.info?.phone ?? '').trim() ||
    form.email?.trim() !== (userStore.info?.email ?? '').trim(),
);

/** 只读账号信息行 */
const accountRows = computed(() => {
  const info = userStore.info;
  return [
    { label: '账号 ID', value: info?.id ?? '', canCopy: Boolean(info?.id) },
    { label: '登录账号', value: info?.username ?? '', canCopy: Boolean(info?.username) },
  ];
});

/** 自定义校验：昵称必填，手机号/邮箱选填（空值放行，有值时校验格式），失败时 Message 提示 */
function validate(): boolean {
  const nickname = form.nickname?.trim();
  if (!nickname) {
    message.error('昵称不能为空');
    return false;
  }
  if (nickname.length > 20) {
    message.error('昵称最多 20 个字符');
    return false;
  }

  const phone = form.phone?.trim();
  if (phone && !PHONE_RE.test(phone)) {
    message.error('手机号格式不正确');
    return false;
  }

  const email = form.email?.trim();
  if (email && !EMAIL_RE.test(email)) {
    message.error('邮箱格式不正确');
    return false;
  }

  return true;
}

/** 保存资料：自定义校验通过后提交，成功后同步主进程持久化与本地 store */
async function save() {
  if (!userStore.info || saving.value || !validate()) return;

  saving.value = true;
  try {
    const draft: Partial<User> = {
      nickname: form.nickname?.trim(),
      phone: form.phone?.trim(),
      email: form.email?.trim(),
    };

    const raw = await $request<{ user?: User } | User>('/user/update-info', {
      method: 'POST',
      body: draft,
    });

    // @ts-ignore
    const updated: Partial<User> = raw && 'user' in raw ? (raw.user ?? {}) : (raw ?? {});
    const next: User = { ...userStore.info, ...updated };

    userStore.updateUserInfo(next);
    syncForm(next);

    message.success('资料已保存');
  } catch {
    message.error('保存失败，请稍后重试');
  } finally {
    saving.value = false;
  }
}

/** 恢复为已保存资料 */
function cancel() {
  const info = userStore.info;
  if (!info) return;
  syncForm(info);
}

/** 复制账号信息到剪贴板 */
async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success(`${label}已复制`);
  } catch {
    message.error('复制失败');
  }
}
</script>

<template>
  <AmySkeleton
    :loading="!userStore.info"
    :active="true"
    :avatar="{ size: 48 }"
    :title="{ width: 200 }"
    :paragraph="{ rows: 3 }"
  >
    <div class="w-full flex flex-col gap-y-3">
      <!-- 身份头部 -->
      <div class="flex items-center gap-x-4">
        <UAvatar
          :src="userStore.info?.avatar"
          :alt="displayName"
          icon="i-lucide-image"
          size="3xl"
          class="shrink-0"
        />

        <div class="flex flex-col gap-0.5 min-w-0">
          <p class="text-lg font-semibold text-default truncate leading-6">
            {{ displayName }}
          </p>
          <p class="text-sm text-muted truncate">@{{ userStore.info?.username || '—' }}</p>
        </div>
      </div>

      <!-- 基本信息：可编辑 -->
      <section class="w-full rounded-2xl bg-card border border-default p-5">
        <div class="flex items-center gap-x-1.5 mb-5">
          <UIcon name="i-lucide-user" class="size-4 text-primary shrink-0" />
          <h3 class="text-sm font-medium text-default">基本信息</h3>
        </div>

        <div class="flex flex-col gap-4">
          <UFormField label="昵称" required>
            <UInput
              v-model="form.nickname"
              placeholder="请输入昵称"
              class="w-full"
              @keydown.enter="save"
            />
          </UFormField>

          <UFormField label="手机号" hint="选填">
            <UInput
              v-model="form.phone"
              placeholder="请输入手机号"
              class="w-full"
              @keydown.enter="save"
            >
              <template #leading>
                <UIcon name="i-lucide-phone" class="size-4" />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="邮箱" hint="选填">
            <UInput
              v-model="form.email"
              placeholder="请输入邮箱"
              class="w-full"
              @keydown.enter="save"
            >
              <template #leading>
                <UIcon name="i-lucide-mail" class="size-4" />
              </template>
            </UInput>
          </UFormField>

          <div class="flex justify-end gap-x-2 pt-1">
            <UButton variant="outline" color="neutral" :disabled="saving || !dirty" @click="cancel">
              取消
            </UButton>
            <UButton :loading="saving" :disabled="!dirty" @click="save"> 保存 </UButton>
          </div>
        </div>
      </section>

      <!-- 账号信息：只读 -->
      <section class="w-full rounded-2xl bg-card border border-default p-5">
        <div class="flex items-center gap-x-1.5 mb-2">
          <UIcon name="i-lucide-shield" class="size-4 text-primary shrink-0" />
          <h3 class="text-sm font-medium text-default">账号信息</h3>
        </div>

        <div class="flex flex-col">
          <div
            v-for="row in accountRows"
            :key="row.label"
            class="flex items-center justify-between gap-x-4 py-2.5 border-b border-default last:border-b-0"
          >
            <span class="text-sm text-muted shrink-0">{{ row.label }}</span>
            <div class="flex items-center gap-x-1.5 min-w-0">
              <span class="text-sm text-default font-mono truncate">{{ row.value || '—' }}</span>
              <UButton
                v-if="row.canCopy"
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-lucide-copy"
                :aria-label="`复制${row.label}`"
                @click="copyText(row.value, row.label)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </AmySkeleton>
</template>

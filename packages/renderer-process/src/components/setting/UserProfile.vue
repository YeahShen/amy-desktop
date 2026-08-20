<script setup lang="tsx">
import { message } from 'antdv-next';
import type { FormInstance } from 'antdv-next';
import type { User } from '@amy/shared';

const userStore = useUserStore();

const formRef = ref<FormInstance>();
const form = ref<Partial<User>>({});
const saving = ref(false);

// 用户信息加载后回填表单
watch(
  () => userStore.info,
  (info) => {
    if (info) {
      form.value = {
        nickname: info.nickname ?? '',
        phone: info.phone ?? '',
        email: info.email ?? '',
      };
    }
  },
  { immediate: true },
);

async function save() {
  try {
    await formRef.value?.validate();
  } catch {
    // 校验未通过
    return;
  }

  saving.value = true;

  try {
    const { user } = await $request<{ user: User }>('/user/update-info', {
      method: 'POST',
      body: form.value,
    });

    userStore.updateUserInfo(user);
    message.success('资料保存成功');
  } catch (e: any) {
    message.error(e?.message ?? '保存失败，请稍后重试');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <!-- 用户信息卡 -->
    <div class="w-full flex items-center gap-x-4 p-4 rounded-xl bg-card border border-default">
      <a-avatar :size="64" :src="userStore.info?.avatar">
        <template #icon>
          <NuxtIcon name="amy:user-outlined" size="28" />
        </template>
      </a-avatar>

      <div class="min-w-0">
        <p class="text-[15px] font-medium text-highlighted truncate">
          {{ userStore.info?.nickname || userStore.info?.username || '未设置昵称' }}
        </p>
        <p class="text-xs text-muted mt-0.5 truncate">
          {{ userStore.info?.email || '未绑定邮箱' }}
        </p>
      </div>
    </div>

    <!-- 资料编辑表单 -->
    <a-form ref="formRef" :model="form" layout="vertical">
      <a-form-item label="昵称" name="nickname" :rules="[{ required: true, message: '请输入昵称' }]">
        <a-input v-model:value="form.nickname" placeholder="请输入昵称" allow-clear />
      </a-form-item>

      <a-form-item
        label="手机号"
        name="phone"
        :rules="[{ pattern: /^1\d{10}$/, message: '请输入正确的手机号' }]"
      >
        <a-input v-model:value="form.phone" placeholder="请输入手机号" allow-clear />
      </a-form-item>

      <a-form-item
        label="邮箱"
        name="email"
        :rules="[{ type: 'email', message: '请输入正确的邮箱' }]"
      >
        <a-input v-model:value="form.email" placeholder="请输入邮箱" allow-clear />
      </a-form-item>

      <AButton type="primary" :loading="saving" @click="save">保存</AButton>
    </a-form>
  </div>
</template>

<style lang="scss"></style>

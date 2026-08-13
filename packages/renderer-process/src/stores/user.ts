import type { User } from '@amy/shared';

export const useUserStore = defineStore('userStore', () => {
  const token = ref('');
  const info = ref<User>();

  onMounted(async () => {
    const detail = await window.electronAPI.invoke<{ token: string; info: User }>(
      'get-user-detail',
    );

    token.value = detail.token;
    info.value = detail.info;
  });

  function updateUserInfo(user: User) {
    info.value = user;
    window.electronAPI.send('set-user-info', user);
  }

  return {
    token,
    info,
    updateUserInfo,
  };
});

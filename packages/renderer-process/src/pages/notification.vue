<script setup lang="tsx">
import { notification } from 'antdv-next';
import type { NotificationInstance } from 'antdv-next/dist/notification/interface';

definePageMeta({
  layout: 'empty',
});

const [api, ContextHolder] = notification.useNotification({
  maxCount: 3,
  placement: 'bottomRight',
  showProgress: true,
  // duration: false,
});

onMounted(() => {
  window.electronAPI.on(
    'notify-message',
    (data: { type: Exclude<keyof NotificationInstance, 'destroy'>; message: string }) => {
      openNotification(data.type, data.message);
    },
  );
});

async function openNotification(
  type: Exclude<keyof NotificationInstance, 'destroy'>,
  message: string,
) {
  api[type]({
    title: `AMY STATION`,
    description: h(
      defineComponent(() => {
        return () => (
          <>
            <div class="pt-1 pb-2">
              <p>{message}</p>
            </div>
          </>
        );
      }),
    ),
    styles: {
      icon: {
        fontSize: '17px',
        marginTop: '5px',
      },
    },
    onClose: () => {
      window.electronAPI.send('set-ignore-mouse-events', true);
    },
  });

  await nextTick();

  const instances = document.querySelectorAll('.ant-notification-notice');

  instances.forEach((instance) => {
    instance.addEventListener('mouseenter', () => {
      window.electronAPI.send('set-ignore-mouse-events', false);
    });
    instance.addEventListener('mouseleave', () => {
      window.electronAPI.send('set-ignore-mouse-events', true);
    });
  });
}
</script>

<template>
  <div class="notifictation-window-body">
    <ContextHolder />
  </div>
</template>

<style lang="scss">
.notifictation-window-body {
  #nuxt-devtools-container {
    display: none !important;
  }
}
</style>

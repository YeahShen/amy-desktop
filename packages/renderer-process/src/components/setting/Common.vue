<script setup lang="tsx">
import type { ApiUrls, ColorMode, HideHomeWindowOrExit } from '@amy/shared';

/* ── 外观：主题模式 ──────────────────────────────── */

const colorModeSetting = useSettings('colorMode');
const { colorMode: colorModeCookie } = useColorMode();

let systemThemeQuery: MediaQueryList | undefined;
let systemThemeHandler: ((e: MediaQueryListEvent) => void) | undefined;

/** 应用主题偏好：持久化设置 + 解析"跟随系统"后同步 cookie（驱动 <html> class） */
function applyColorMode(mode: ColorMode) {
  if (!import.meta.client) return;

  if (mode === 'system') {
    systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeHandler = (e) => {
      colorModeCookie.value = e.matches ? 'dark' : 'light';
    };
    systemThemeQuery.addEventListener('change', systemThemeHandler);
    colorModeCookie.value = systemThemeQuery.matches ? 'dark' : 'light';
  } else {
    systemThemeQuery?.removeEventListener('change', systemThemeHandler!);
    systemThemeQuery = undefined;
    colorModeCookie.value = mode;
  }
}

onUnmounted(() => {
  systemThemeQuery?.removeEventListener('change', systemThemeHandler!);
});

const themeMode = computed({
  get: () => colorModeSetting.value ?? 'system',
  set: (v: ColorMode) => {
    colorModeSetting.value = v; // useSettings watch 回写持久化
    applyColorMode(v);
  },
});

const themeOptions: { label: string; value: ColorMode }[] = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'system' },
];

/* ── 窗口 ────────────────────────────────────────── */

const showFloatWindow = useSettings('appRunSettings.showFloatWindow');

watch(showFloatWindow, (v) => {
  if (v) {
    window.electronAPI.send('open-float-window');
  } else {
    window.electronAPI.send('close-float-window');
  }
});

const hideHomeWindowOrExit = useSettings('hideHomeWindowOrExit');

const closeWindowMode = computed({
  get: () => hideHomeWindowOrExit.value ?? 'hide',
  set: (v: HideHomeWindowOrExit) => {
    hideHomeWindowOrExit.value = v;
  },
});

const closeWindowOptions: { label: string; value: HideHomeWindowOrExit }[] = [
  { label: '隐藏到托盘', value: 'hide' },
  { label: '退出应用', value: 'exit' },
];

/* ── 网络，代理 ────────────────────────────────────── */

const proxyEnabled = useSettings('proxy.enabled');
const proxyUrl = useSettings('proxy.url');

const apis = ref<ApiUrls['list']>([]);
const enableApi = ref<string>();
const newApi = ref<string>('');

onMounted(() => {
  window.electronAPI.invoke<ApiUrls['list']>('get-api-urls').then((res) => {
    apis.value = res;
    enableApi.value = res.find((i) => i.isEnable)?.url;
  });

  watch(enableApi, (url) => {
    if (!url) return;
    apis.value.forEach((i) => (i.isEnable = i.url === url));
    update(apis.value);
  });
});

function addApiItem() {
  const url = newApi.value.trim();
  if (!url) return;

  apis.value.push({ url, isEnable: false });
  newApi.value = '';

  enableApi.value = url; // 或按需切换
  update(apis.value); // 通知主进程落库
}

function update(list: ApiUrls['list']) {
  window.electronAPI.send('set-api-urls', toRaw(list));
}

/* ── 登录偏好 ────────────────────────────────────── */

const autoLogin = useSettings('login.autoLogin');
const rememberPassword = useSettings('login.remenberMe');
</script>

<template>
  <div class="w-full flex flex-col gap-y-4">
    <!-- 外观 -->
    <section class="rounded-xl bg-card border border-default overflow-hidden">
      <header class="px-4 py-2.5 text-[13px] font-medium text-toned">外观</header>

      <div class="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-default">
        <div class="min-w-0">
          <p class="text-sm">主题模式</p>
          <p class="text-xs text-muted mt-0.5">跟随系统时自动响应系统外观变化</p>
        </div>
        <a-segmented v-model:value="themeMode" :options="themeOptions" class="shrink-0" />
      </div>
    </section>

    <!-- 窗口 -->
    <section class="rounded-xl bg-card border border-default overflow-hidden">
      <header class="px-4 py-2.5 text-[13px] font-medium text-toned">窗口</header>

      <div class="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-default">
        <div class="min-w-0">
          <p class="text-sm">显示悬浮窗</p>
          <p class="text-xs text-muted mt-0.5">登录后在桌面显示快捷悬浮入口</p>
        </div>
        <a-switch v-model:checked="showFloatWindow" class="shrink-0" />
      </div>

      <div class="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-default">
        <div class="min-w-0">
          <p class="text-sm">关闭主窗口时</p>
          <p class="text-xs text-muted mt-0.5">点击窗口关闭按钮后的行为</p>
        </div>
        <a-segmented
          v-model:value="closeWindowMode"
          :options="closeWindowOptions"
          class="shrink-0"
        />
      </div>
    </section>

    <section class="rounded-xl bg-card border border-default overflow-hidden">
      <header class="px-4 py-2.5 text-[13px] font-medium text-toned">API 接口</header>

      <div
        class="px-4 py-3 flex items-start justify-between gap-x-4 border-t border-default flex-col"
      >
        <div class="min-w-0">
          <p class="text-sm">接口基础地址</p>
        </div>

        <div class="w-full mt-2">
          <a-select
            v-model:value="enableApi"
            class="w-full"
            :options="apis.map((i) => ({ value: i.url }))"
          >
            <template #popupRender="menu">
              <component :is="menu" />
              <a-divider style="margin: 8px 0" />
              <a-space style="padding: 0 8px 4px">
                <a-input v-model:value="newApi" class="w-full" @keydown.stop />
                <a-button type="primary" @click="addApiItem"> 添加 </a-button>
              </a-space>
            </template>
          </a-select>
        </div>
      </div>
    </section>

    <!-- 网络代理 -->
    <section class="rounded-xl bg-card border border-default overflow-hidden">
      <header class="px-4 py-2.5 text-[13px] font-medium text-toned">网络代理</header>

      <div class="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-default">
        <div class="min-w-0">
          <p class="text-sm">启用代理</p>
          <p class="text-xs text-muted mt-0.5">所有 API 请求经代理服务器转发</p>
        </div>
        <a-switch v-model:checked="proxyEnabled" class="shrink-0" />
      </div>

      <div class="px-4 py-3 flex justify-between gap-x-4 border-t border-default flex-col gap-y-2">
        <div class="min-w-0">
          <p class="text-sm">代理地址</p>
          <p class="text-xs text-muted mt-0.5">支持 http / https / socks5</p>
        </div>
        <a-input
          v-model:value="proxyUrl"
          :disabled="!proxyEnabled"
          placeholder="http://127.0.0.1:7890"
          allow-clear
          class="w-52 shrink-0"
        />
      </div>
    </section>

    <!-- 登录偏好 -->
    <section class="rounded-xl bg-card border border-default overflow-hidden">
      <header class="px-4 py-2.5 text-[13px] font-medium text-toned">登录偏好</header>

      <div class="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-default">
        <div class="min-w-0">
          <p class="text-sm">记住密码</p>
          <p class="text-xs text-muted mt-0.5">下次登录自动填充已保存账号的密码</p>
        </div>
        <a-switch v-model:checked="rememberPassword" class="shrink-0" />
      </div>

      <div class="px-4 py-3 flex items-center justify-between gap-x-4 border-t border-default">
        <div class="min-w-0">
          <p class="text-sm">自动登录</p>
          <p class="text-xs text-muted mt-0.5">打开应用后直接使用上次账号登录</p>
        </div>
        <a-switch v-model:checked="autoLogin" class="shrink-0" />
      </div>
    </section>
  </div>
</template>

<style lang="scss"></style>

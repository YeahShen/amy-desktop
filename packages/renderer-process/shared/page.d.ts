import 'vue-router';

export interface DialogMeta {
  title: string;
  subtitle?: string;
  minSizeAble?: boolean;
  customCloseWindowFn?: boolean;
}

declare module 'vue-router' {
  interface RouteMeta {
    dialog: DialogMeta;
    requiresAuth?: boolean;
  }
}

declare module '#app' {
  // 扩展 PageMeta 接口
  interface PageMeta {
    colorMode?: 'light' | 'dark';
    immersiveSidebar?: boolean;
    workspace?: 'artist' | 'film' | 'home' | 'clound' | 'photograph';
    dialog?: DialogMeta;
  }
}

// 必须导出，使类型扩展生效
export {};

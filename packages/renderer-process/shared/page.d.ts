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
    immersiveHeader?: boolean;
    workspace?: 'artist' | 'film' | 'home' | 'cloud' | 'photograph';
    dialog?: DialogMeta;
    sidebarMode?: 'immersive' | 'default' | 'frosted';
  }
}

// 必须导出，使类型扩展生效
export {};

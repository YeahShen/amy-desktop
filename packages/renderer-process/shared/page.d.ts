import 'vue-router'

export interface DialogMeta {
  title: string
  subtitle?: string
  minSizeAble?: boolean
  customCloseWindowFn?: boolean
}

declare module 'vue-router' {
  interface RouteMeta {
    dialog: DialogMeta
    requiresAuth?: boolean
  }
}

declare module '#app' {
  // 扩展 PageMeta 接口
  interface PageMeta {
    colorMode?: 'light' | 'dark'
    space?: 'actor' | 'video' | 'home' | 'clound' | 'photo'
    dialog?: DialogMeta
    sideBarMenu?: {
      icon: string
      title: string
      order: number
      type: 'page' | 'dialog' | 'fun'
      iconClass?: string
      callFn?: () => void
    }
  }
}

// 必须导出，使类型扩展生效
export {}

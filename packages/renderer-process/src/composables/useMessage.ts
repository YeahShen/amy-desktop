import type { Component, VNode } from 'vue'
import { reactive } from 'vue'

// ── 类型定义 ────────────────────────────────────────────

export type MessageType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export interface MessageConfig {
  /** 消息类型 */
  type?: MessageType
  /** 消息内容（支持字符串或 VNode） */
  content?: string | VNode
  /** 自动关闭延时（ms），0 表示不自动关闭，默认 3000 */
  duration?: number
  /** 关闭时的回调 */
  onClose?: () => void
  /** 自定义图标 */
  icon?: Component | VNode | string
  /** 消息唯一标识，相同 key 的消息会被替换 */
  key?: string | number
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: Record<string, string>
  /** 点击消息时的回调 */
  onClick?: (e: MouseEvent) => void
}

export interface MessageItem extends Required<Omit<MessageConfig, 'key' | 'icon'>> {
  key: string | number
  id: number
  icon: Component | VNode | string
  createdAt: number
  leaving: boolean
}

// ── 全局配置 ────────────────────────────────────────────

export interface MessageGlobalConfig {
  duration: number
  maxCount: number
  top: number
}

const globalConfig = reactive<MessageGlobalConfig>({
  duration: 3000,
  maxCount: 3,
  top: 24,
})

// ── 状态 ────────────────────────────────────────────────

const messages = reactive<MessageItem[]>([])
let nextId = 0

function generateKey(): string {
  return `amy-msg-${nextId}`
}

// ── 内部方法 ────────────────────────────────────────────

function removeMessage(id: number) {
  const item = messages.find((m) => m.id === id)
  if (!item) return
  item.onClose?.()
  const idx = messages.indexOf(item)
  if (idx > -1) messages.splice(idx, 1)
}

function addMessage(config: MessageConfig & { type: MessageType }): MessageItem {
  const key = config.key ?? generateKey()
  const id = nextId++
  const duration = config.duration ?? globalConfig.duration

  // 相同 key 的消息先移除（替换行为）
  const existing = messages.find((m) => m.key === key)
  if (existing) {
    messages.splice(messages.indexOf(existing), 1)
  }

  const item: MessageItem = {
    type: config.type,
    content: config.content ?? '',
    duration,
    onClose: config.onClose ?? (() => {}),
    icon: config.icon ?? '',
    key,
    id,
    createdAt: Date.now(),
    leaving: false,
    className: config.className ?? '',
    style: config.style ?? {},
    onClick: config.onClick ?? (() => {}),
  }

  // 超出最大数量时移除最早的消息
  while (messages.length >= globalConfig.maxCount) {
    messages.shift()
  }

  messages.push(item)

  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      const msg = messages.find((m) => m.id === id)
      if (msg) {
        msg.leaving = true
        // 等离开动画结束后再移除
        setTimeout(() => removeMessage(id), 300)
      }
    }, duration)
  }

  return item
}

// ── 公开 API ────────────────────────────────────────────

/**
 * 全局消息提示，用法类似 Ant Design 的 message API：
 * ```ts
 * const message = useMessage()
 * message.success('操作成功')
 * message.error('操作失败', 5000)
 * message.open({ type: 'info', content: '提示', duration: 0 })
 * message.destroy()           // 销毁所有
 * message.config({ maxCount: 5 })
 * ```
 */
export function useMessage() {
  function open(config: MessageConfig) {
    return addMessage({ ...config, type: config.type ?? 'info' })
  }

  function success(content: string | VNode, duration?: number, onClose?: () => void) {
    return addMessage({ type: 'success', content, duration, onClose })
  }

  function error(content: string | VNode, duration?: number, onClose?: () => void) {
    return addMessage({ type: 'error', content, duration, onClose })
  }

  function info(content: string | VNode, duration?: number, onClose?: () => void) {
    return addMessage({ type: 'info', content, duration, onClose })
  }

  function warning(content: string | VNode, duration?: number, onClose?: () => void) {
    return addMessage({ type: 'warning', content, duration, onClose })
  }

  function loading(content: string | VNode, duration?: number, onClose?: () => void) {
    // loading 默认不自动关闭
    return addMessage({ type: 'loading', content, duration: duration ?? 0, onClose })
  }

  function destroy(key?: string | number) {
    if (key === undefined) {
      // 销毁全部
      messages.forEach((m) => m.onClose?.())
      messages.splice(0)
    } else {
      const msg = messages.find((m) => m.key === key)
      if (msg) {
        msg.leaving = true
        setTimeout(() => removeMessage(msg.id), 300)
      }
    }
  }

  function config(opts: Partial<MessageGlobalConfig>) {
    if (opts.duration !== undefined) globalConfig.duration = opts.duration
    if (opts.maxCount !== undefined) globalConfig.maxCount = opts.maxCount
    if (opts.top !== undefined) globalConfig.top = opts.top
  }

  return {
    /** 当前消息列表（只读） */
    messages,
    /** 全局配置（只读） */
    globalConfig,
    open,
    success,
    error,
    info,
    warning,
    loading,
    destroy,
    config,
  }
}

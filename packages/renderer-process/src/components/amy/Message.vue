<script setup lang="ts">
import { useMessage } from '../../composables/useMessage'

const { messages, globalConfig } = useMessage()

function onItemClick(item: (typeof messages)[number], e: MouseEvent) {
  item.onClick?.(e)
}

function onCloseClick(item: (typeof messages)[number]) {
  item.leaving = true
  // 等离开动画结束
  setTimeout(() => {
    const idx = messages.findIndex((m) => m.id === item.id)
    if (idx > -1) {
      item.onClose?.()
      messages.splice(idx, 1)
    }
  }, 300)
}
</script>

<template>
  <Teleport to="body">
    <div class="amy-message-wrap" :style="{ '--msg-top': globalConfig.top + 'px' }">
      <TransitionGroup name="msg">
        <div
          v-for="item in messages"
          :key="item.id"
          class="amy-message-item"
          :class="[`msg--${item.type}`, { 'msg--leaving': item.leaving }, item.className]"
          :style="item.style"
          @click="onItemClick(item, $event)"
        >
          <!-- 图标 -->
          <span class="msg-icon">
            <!-- success -->
            <svg v-if="item.type === 'success'" viewBox="0 0 24 24" width="16" height="16" fill="none">
              <circle
                cx="12" cy="12" r="10"
                stroke="currentColor" stroke-width="2"
                class="msg-icon-circle"
              />
              <path
                d="M8 12.5l2.5 2.5L16 9"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
                class="msg-icon-check"
              />
            </svg>
            <!-- error -->
            <svg v-else-if="item.type === 'error'" viewBox="0 0 24 24" width="16" height="16" fill="none">
              <circle
                cx="12" cy="12" r="10"
                stroke="currentColor" stroke-width="2"
                class="msg-icon-circle"
              />
              <path
                d="M15 9l-6 6M9 9l6 6"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
              />
            </svg>
            <!-- warning -->
            <svg v-else-if="item.type === 'warning'" viewBox="0 0 24 24" width="16" height="16" fill="none">
              <path
                d="M12 2L2 22h20L12 2z"
                stroke="currentColor" stroke-width="2"
                stroke-linejoin="round"
                class="msg-icon-warn-tri"
              />
              <path d="M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
            <!-- info -->
            <svg v-else-if="item.type === 'info'" viewBox="0 0 24 24" width="16" height="16" fill="none">
              <circle
                cx="12" cy="12" r="10"
                stroke="currentColor" stroke-width="2"
                class="msg-icon-circle"
              />
              <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <circle cx="12" cy="8" r="0.5" fill="currentColor" />
            </svg>
            <!-- loading -->
            <svg v-else-if="item.type === 'loading'" viewBox="0 0 24 24" width="16" height="16" fill="none" class="msg-icon-loading">
              <circle
                cx="12" cy="12" r="9"
                stroke="currentColor" stroke-width="2"
                opacity="0.2"
                class="msg-icon-circle"
              />
              <path
                d="M12 3a9 9 0 0 1 9 9"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>

          <!-- 内容 -->
          <span class="msg-content">{{ item.content }}</span>

          <!-- 关闭按钮 -->
          <button
            v-if="item.duration === 0"
            class="msg-close"
            title="关闭"
            @click.stop="onCloseClick(item)"
          >
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor" stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss">
// ── 容器 ────────────────────────────────────────────────

.amy-message-wrap {
  position: fixed;
  top: var(--msg-top, 24px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

// ── 消息条目 ────────────────────────────────────────────

.amy-message-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  background: var(--ui-bg-card, #fff);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 0 1px rgba(0, 0, 0, 0.08);
  font-size: 14px;
  line-height: 1.5715;
  color: var(--ui-text, rgba(0, 0, 0, 0.88));
  pointer-events: auto;
  cursor: default;
  max-width: 480px;
  word-break: break-word;
}

// ── 类型色 ──────────────────────────────────────────────

.msg--success .msg-icon {
  color: #52c41a;
}

.msg--error .msg-icon {
  color: #ff4d4f;
}

.msg--info .msg-icon {
  color: #1677ff;
}

.msg--warning .msg-icon {
  color: #faad14;
}

.msg--loading .msg-icon {
  color: #1677ff;
}

// ── 图标 ────────────────────────────────────────────────

.msg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.msg-icon-loading {
  animation: msg-spin 1s linear infinite;
}

@keyframes msg-spin {
  to {
    transform: rotate(360deg);
  }
}

// ── 内容 ────────────────────────────────────────────────

.msg-content {
  flex: 1;
  min-width: 0;
}

// ── 关闭按钮 ────────────────────────────────────────────

.msg-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: none;
  color: var(--ui-text-muted, rgba(0, 0, 0, 0.45));
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: var(--ui-text, rgba(0, 0, 0, 0.88));
    background: rgba(0, 0, 0, 0.06);
  }
}

// ── 深色模式 ────────────────────────────────────────────

.dark .amy-message-item {
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 0 1px rgba(255, 255, 255, 0.08);
}

.dark .msg-close:hover {
  background: rgba(255, 255, 255, 0.08);
}

// ── 入场 / 离场动画 ─────────────────────────────────────

.msg-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.msg-leave-active {
  transition: all 0.25s ease-in;
}

.msg-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.msg-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

// 其他条目随上方条目消失而上移
.msg-move {
  transition: transform 0.25s ease;
}
</style>

<script setup lang="ts">
defineProps<{
  disabledScroll?: boolean;
  immersiveHeader?: boolean;
  hidNavbarContent?: boolean;
  classes?: {
    content?: string;
  };
}>();

const searching = inject(SEARCHING_INJECTION_KEY);
</script>

<template>
  <div class="w-full h-full">
    <div
      class="navbar-placeholder z-999"
      :class="[{ 'bg-(--ui-bg)/20 glass-bg': immersiveHeader, 'bg-container': !immersiveHeader }]"
    >
      <div class="w-3/7 h-full pl-4 flex items-center overflow-hidden">
        <AmyFadeTransition>
          <div v-if="!searching && !hidNavbarContent" class="w-fit h-fit">
            <slot name="navbar-content"></slot>
          </div>
        </AmyFadeTransition>
      </div>
    </div>

    <AmyScrollbar track-class="common-content_track" :disabled="disabledScroll">
      <div class="w-full min-h-screen pt-nav" :class="[classes?.content]">
        <slot />
      </div>
    </AmyScrollbar>
  </div>
</template>

<style lang="scss">
.navbar-placeholder {
  position: fixed;
  height: var(--navbar-height);
  left: var(--sidebar-width);
  right: 0;
  top: 0;
}
</style>

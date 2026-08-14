<script setup lang="ts"></script>

<template>
  <ClientOnly>
    <Teleport to="#layout-navbar-left-context">
      <div class="w-fit h-fit no-drag">
        <slot />
      </div>
    </Teleport>
  </ClientOnly>
</template>

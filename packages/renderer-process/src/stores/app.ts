export const useAppStore = defineStore('appStore', () => {
  const searchActive = ref(false);

  const showNavbarLeftContent = computed(() => searchActive.value === false);

  return {
    showNavbarLeftContent,
    searchActive,
  };
});

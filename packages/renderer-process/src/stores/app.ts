export const useAppStore = defineStore('appStore', () => {
  const searchActive = ref(false);

  const showNavbarLeftContent = computed(() => searchActive.value === false);

  const drawer = ref({
    open: false,
    title: '',
    component: '',
  });

  return {
    showNavbarLeftContent,
    searchActive,
    drawer,
  };
});

export const useAppStore = defineStore('appStore', () => {
  const searchActive = ref(false);
  const disableScrollbar = ref(false);

  const showNavbarLeftContent = computed(() => searchActive.value === false);

  const drawer = ref({
    open: false,
    title: '',
    component: '',
  });

  function setScrollBarStatus(enabled: boolean) {
    disableScrollbar.value = !enabled;
  }

  return {
    showNavbarLeftContent,
    disableScrollbar,
    searchActive,
    drawer,
    setScrollBarStatus,
  };
});

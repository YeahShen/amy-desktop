import { useWindowSize } from '@vueuse/core';

export type ListWrapEnat = {
  sideWidth: number;
  gapX: number;
  itemMinWidth: number;
  columnCount: number;
};

export const useAppStore = defineStore('appStore', () => {
  const searchActive = ref(false);
  const disableScrollbar = ref(false);
  const { width } = useWindowSize();

  const showNavbarLeftContent = computed(() => searchActive.value === false);

  const lwem = reactive(new Map<string, ListWrapEnat>());

  const drawer = ref({
    open: false,
    title: '',
    component: '',
  });

  function setScrollBarStatus(enabled: boolean) {
    disableScrollbar.value = !enabled;
  }

  function calcArtistListPageLoadingNum(width: number) {
    const sideWidth = 16;
    const gapX = 14;
    const itemMinWidth = 80;

    const columnCount = Math.floor(
      (width - sideWidth * 2 + gapX) / Math.max(1, itemMinWidth + gapX),
    );

    lwem.set('artistlistpage', {
      sideWidth,
      gapX,
      itemMinWidth,
      columnCount,
    });
  }

  onMounted(() => {
    watch(
      width,
      (w) => {
        calcArtistListPageLoadingNum(w - 70);
      },
      {
        immediate: true,
      },
    );
  });

  return {
    showNavbarLeftContent,
    disableScrollbar,
    searchActive,
    drawer,
    setScrollBarStatus,
    lwem,
  };
});

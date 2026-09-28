import { useWindowSize } from '@vueuse/core';

export type ListPage = 'artistlistPage' | 'artistDetailPage';

export type ListWrapPageArgs = {
  sideWidth: number;
  gapX: number;
  itemMinWidth: number;
};

const ListWrapPage: Record<ListPage, ListWrapPageArgs> = {
  artistlistPage: {
    sideWidth: 16,
    gapX: 24,
    itemMinWidth: 90,
  },
  artistDetailPage: {
    sideWidth: 32,
    gapX: 36,
    itemMinWidth: 220,
  },
};

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

  const lwem = reactive(new Map<ListPage, ListWrapEnat>());

  const drawer = ref({
    open: false,
    title: '',
    component: '',
  });

  function setScrollBarStatus(enabled: boolean) {
    disableScrollbar.value = !enabled;
  }

  function calcArtistListPageLoadingNumx(opt: ListWrapPageArgs, width: number) {
    const { sideWidth, gapX, itemMinWidth } = opt;

    const columnCount = Math.floor(
      (width - sideWidth * 2 + gapX) / Math.max(1, itemMinWidth + gapX),
    );

    return {
      sideWidth,
      gapX,
      itemMinWidth,
      columnCount,
    };
  }

  onMounted(() => {
    watch(
      width,
      (w) => {
        Object.entries(ListWrapPage).forEach(([key, value]) => {
          lwem.set(key as ListPage, calcArtistListPageLoadingNumx(value, w - 70));
        });
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

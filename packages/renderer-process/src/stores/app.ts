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

export const SEARCHING_INJECTION_KEY = Symbol() as InjectionKey<Ref<boolean>>;

function calcArtistListPageLoadingNumx(opt: ListWrapPageArgs, width: number): ListContainerOption {
  const { sideWidth, gapX, itemMinWidth } = opt;

  const columnCount = Math.floor((width - sideWidth * 2 + gapX) / Math.max(1, itemMinWidth + gapX));

  return {
    sideWidth,
    gapX,
    itemMinWidth,
    columnCount,
  };
}

export const useAppStore = defineStore('appStore', () => {
  const { width } = useWindowSize();
  const listContailerPropMap = reactive(new Map<RegisteredList, ListContainerProperties>());

  const lwem = reactive(new Map<ListPage, ListWrapEnat>());

  const drawer = ref({
    open: false,
    title: '',
    component: '',
  });

  onMounted(() => {
    watch(
      width,
      (w) => {
        Object.entries(ListWrapPage).forEach(([key, value]) => {
          lwem.set(key as ListPage, calcArtistListPageLoadingNumx(value, w - 70));
        });

        Object.entries(registeredListContainers).forEach(([key, value]) => {
          listContailerPropMap.set(
            key as RegisteredList,
            new ListContainerProperties(calcArtistListPageLoadingNumx(value, w - 70)),
          );
        });
      },
      {
        immediate: true,
      },
    );
  });

  return {
    drawer,
    lwem,
    listContailerPropMap,
  };
});

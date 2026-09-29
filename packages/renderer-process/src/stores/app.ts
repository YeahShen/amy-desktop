import { useWindowSize } from '@vueuse/core';

export type ListWrapPageArgs = {
  sideWidth: number;
  gapX: number;
  itemMinWidth: number;
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
  const listContailerPropMap = reactive(new Map<RegisteredList, ListContainerOption>());

  const drawer = ref({
    open: false,
    title: '',
    component: '',
  });

  onMounted(() => {
    watch(
      width,
      (w) => {
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
    listContailerPropMap,
  };
});

export type ListContainerOption = {
  sideWidth: number;
  gapX: number;
  itemMinWidth: number;
  columnCount: number;
};

export class ListContainerProperties {
  private _sideWidth: number;
  private _gapX: number;
  private _itemMinWidth: number;
  private _columnCount: number;

  constructor(options: ListContainerOption) {
    this._columnCount = options.columnCount;
    this._gapX = options.gapX;
    this._itemMinWidth = options.itemMinWidth;
    this._sideWidth = options.sideWidth;
  }

  get sideWidth(): number {
    return this._sideWidth || 0;
  }

  get gapX(): number {
    return this._gapX || 0;
  }

  get itemMinWidth(): number {
    return this._itemMinWidth || 0;
  }

  get columnCount(): number {
    return this._columnCount || 0;
  }
}

export type RegisteredList = 'artistlistPage' | 'artistDetailPage';

export type ListContainerArg = {
  sideWidth: number;
  gapX: number;
  itemMinWidth: number;
};
export const registeredListContainers: Record<RegisteredList, ListContainerArg> = {
  artistlistPage: {
    sideWidth: 1,
    gapX: 36,
    itemMinWidth: 90,
  },
  artistDetailPage: {
    sideWidth: 32,
    gapX: 36,
    itemMinWidth: 220,
  },
};

export function useListContainer(name: RegisteredList) {
  const appStore = useAppStore();

  const containerProp = appStore.listContailerPropMap.get(name) as ListContainerProperties;

  return {
    containerProp,
  };
}

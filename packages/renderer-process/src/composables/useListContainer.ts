export class ListContainerProperties {
  private _sideWidth: number;
  private _gapX: number;
  private _itemMinWidth: number;
  private _columnCount: number;

  constructor(options: ListContainerProperties) {
    this._columnCount = options._columnCount;
    this._gapX = options._gapX;
    this._itemMinWidth = options._itemMinWidth;
    this._sideWidth = options._sideWidth;
  }

  get sideWidth(): number {
    return this.sideWidth || 0;
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

export function useListContainer(name: RegisteredList) {
  const appStore = useAppStore();
}

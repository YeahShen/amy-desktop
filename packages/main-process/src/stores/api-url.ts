import { ApiUrls } from '@amy/shared';
import Store from 'electron-store';

const store = new Store<ApiUrls>({ name: 'api-url' });

let cache: ApiUrls['list'] = [];

export function getApiUrls() {
  if (cache.length > 0) return cache;
  let list = store.get('list') || [];

  list = [{ url: BASE_URL, isEnable: false }, ...list];

  if (!list.some((i) => i.isEnable)) {
    list.forEach((i) => {
      if (i.url === BASE_URL) {
        i.isEnable = true;
      }
    });
  }

  return list;
}

export function setApiUrls(
  list: {
    url: string;
    isEnable: boolean;
  }[],
) {
  store.set(
    'list',
    list.filter((i) => i.url !== BASE_URL),
  );
  cache = [];
}

export function getEnableUrl() {
  const list = getApiUrls();
  return list.find((i) => i.isEnable)?.url;
}

import { ApiUrls } from '@amy/shared';
import Store from 'electron-store';

const store = new Store<ApiUrls>({ name: 'api-url' });

export function getApiUrls() {
  let list = store.get('list') || [];

  list = [...list, { url: BASE_URL, isEnable: false }];

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
  store.set('list', list);
}

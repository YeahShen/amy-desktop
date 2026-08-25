import { createAuthAxios } from '@amy/shared';

export const authAxios = createAuthAxios(BASE_URL, () => {
  return 'Bearer ' + getToken();
});

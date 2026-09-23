import { createAuthAxios } from '@amy/shared';

export const authAxios = createAuthAxios(`http://localhost:${PORT}/`, () => {
  return 'Bearer ' + getToken();
});

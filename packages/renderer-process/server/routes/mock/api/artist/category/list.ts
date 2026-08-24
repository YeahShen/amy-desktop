import type { ArtistCategory } from '@amy/shared/types';

export default defineEventHandler(() => {
  const list: ArtistCategory[] = [
    {
      id: 1,
      title: '番剧',
    },
  ];

  return list;
});

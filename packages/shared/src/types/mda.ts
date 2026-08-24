export type ArtistCategory = {
  id: number;
  title: string;
};

export type Artist = {
  id: number;
  name: string;
  description: string;
  avatar: string;
  categoryId: number;
};

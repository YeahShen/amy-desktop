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

export type VideoTag = {
  id: number | string;
  title: string;
};

export type VideoType = {
  id: number;
  title: string;
};

export type VideoPublisher = {
  id: string | number;
  name: string;
};

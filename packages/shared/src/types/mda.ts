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

export type playerVideoDetail = {
  id: string;
  title: string;
  description?: string;
  /** 海报图，缺省时不显示 */
  poster?: string;
  /** 播放地址：mp4 直链或 HLS 的 m3u8 */
  url: string;
  duration?: number;
};

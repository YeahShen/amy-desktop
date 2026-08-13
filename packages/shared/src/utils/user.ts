export interface User {
  id?: string;
  username?: string;
  phone?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  password?: string;
}

export interface UserloggedCacheItem {
  account?: string;
  password?: string;
  lastLoginDate: number;
}

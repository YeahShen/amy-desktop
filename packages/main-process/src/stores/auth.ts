import Store from 'electron-store';
import { type User, createAuthAxios } from '@amy/shared';

const store = new Store<{ token: string; restart?: boolean }>({ name: 'amy-auth' });

class Authenticate {
  protected _info?: User;
  protected _token?: string;

  constructor() {
    const isRestart = store.get('restart');
    if (isRestart) {
      this._token = store.get('token');

      const server = createAuthAxios(BASE_URL, () => this._token as string);

      server
        .get<User>('/auth/info')
        .then(({ data }) => {
          this._info = data;
        })
        .catch(() => {
          this.authenticate = {};
        });
    }
  }

  set authenticate(obj: { info?: User; token?: string }) {
    this._info = obj.info;
    this._token = obj.token;

    store.set('token', obj.info);
  }

  willRestart() {
    store.set('restart', true);
  }

  async getInfo() {
    if (!this._info && this._token) {
      const server = createAuthAxios(BASE_URL, () => this._token as string);
      const { data } = await server.get<User>('/auth/info');
      this._info = data;
    }

    return this._info;
  }

  getToken(): string | undefined {
    return this._token;
  }
}

const authenticate = new Authenticate();

export function removeAuth() {
  store.delete('token');
  authenticate.authenticate = {};
}

export async function getInfo() {
  return await authenticate.getInfo();
}

export function getToken() {
  return authenticate.getToken();
}

export async function isLogin() {
  return !!((await getInfo()) && getToken());
}

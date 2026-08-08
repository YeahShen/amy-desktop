import path from 'node:path';
import fs from 'node:fs';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();

  const url = event.node.req.url;

  console.log(url);

  if (url?.startsWith('/api')) {
    if (url.includes('_nuxt_icon')) return;

    const target = new URL(url, config.public.apiUrl);

    const tokenPath = path.join(process.cwd(), '.nuxt', '_auth_token');

    const headers: Record<string, any> = {};

    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8');

      if (token && !url.includes('/api/auth/login-by-username-password')) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    headers.XPLATFORM = 'client';

    console.log(target.toString());

    return proxyRequest(event, target.toString(), {
      headers,
    });
  }
});

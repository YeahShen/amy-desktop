import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  if (event.node.req.url?.startsWith('/resource')) {
    const target = new URL(event.node.req.url, config.public.apiUrl);

    const headers: Record<string, any> = {};

    const tokenPath = path.join(process.cwd(), '.nuxt', '_auth_token');

    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8');

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    headers.XPLATFORM = 'client';

    return proxyRequest(event, target.toString(), {
      headers,
    });
  }
});

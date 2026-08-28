import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export default defineEventHandler((event) => {
  const { token } = getQuery(event);

  const tokenPath = path.join(process.cwd(), '.nuxt', '_auth_token');
  fs.writeFile(tokenPath, token as string, () => {});
});

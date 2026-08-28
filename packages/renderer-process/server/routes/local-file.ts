import fs from 'node:fs';
import path from 'node:path';

export default defineEventHandler((event) => {
  const { filePath } = getQuery(event);

  if (fs.existsSync(path.resolve(filePath as string))) {
    return fs.readFileSync(filePath as string);
  }

  return 'file no found';
});

import { ZipArchive } from 'archiver';
import path from 'node:path';
import fs from 'node:fs';

export function makeZip(destFiles: string[], zipFile: string) {
  return new Promise<ZipArchive>((resolve, reject) => {
    const output = fs.createWriteStream(zipFile);

    const archive = new ZipArchive({
      zlib: { level: 9 }, // Sets the compression level.
    });

    // 3. 监听事件
    output.on('close', () => {
      resolve(archive);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    destFiles.forEach((artifact) => {
      archive.append(fs.createReadStream(artifact), { name: path.basename(artifact) });
    });

    archive.finalize();
  });
}

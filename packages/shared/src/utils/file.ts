import fs from 'node:fs';

export function fileStat(filePath: string) {
  return fs.statSync(filePath);
}

export function getFileSize(filePath: string) {
  return fileStat(filePath).size;
}

export function getFileTotalChunks(filePath: string, chunkSize: number) {
  return Math.ceil(getFileSize(filePath) / chunkSize);
}

export function fileChunk(filePath: string, chunkSize: number) {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error('chunkSize must be a positive integer');
  }

  const totalChunk = Math.ceil(getFileSize(filePath) / chunkSize);

  function getChunk(index: number) {
    if (!Number.isInteger(index) || index < 1 || index > totalChunk) {
      if (totalChunk === 0) {
        throw new Error('Cannot read chunks from an empty file');
      }
      throw new Error(`Chunk index must be between 1 and ${totalChunk}, got ${index}`);
    }

    const start = (index - 1) * chunkSize;
    const end = start + chunkSize - 1;

    return fs.createReadStream(filePath, {
      start,
      end,
      highWaterMark: end - start + 2,
    });
  }

  return {
    getChunk,
    totalChunk,
  };
}

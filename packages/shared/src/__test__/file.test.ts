import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileStat, getFileSize, fileChunk } from '../utils/file';

const testDir = path.join(os.tmpdir(), `amy-file-test-${Date.now()}`);
const testFile = path.join(testDir, 'test.txt');
const emptyFile = path.join(testDir, 'empty.txt');
const nonExistentFile = path.join(testDir, 'nonexistent.txt');
const testContent = 'Hello, World! This is a test file for chunk reading.';

beforeAll(() => {
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(testFile, testContent, 'utf-8');
  fs.writeFileSync(emptyFile, '', 'utf-8');
});

afterAll(() => {
  fs.rmSync(testDir, { recursive: true, force: true });
});

// ── fileStat ────────────────────────────────────────────────────────────────

describe('fileStat', () => {
  it('should return stats for an existing file', () => {
    const stats = fileStat(testFile);
    expect(stats).toBeDefined();
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBe(Buffer.byteLength(testContent, 'utf-8'));
  });

  it('should throw when file does not exist', () => {
    expect(() => fileStat(nonExistentFile)).toThrow();
  });

  it('should return stats for an empty file', () => {
    const stats = fileStat(emptyFile);
    expect(stats.size).toBe(0);
  });
});

// ── getFileSize ─────────────────────────────────────────────────────────────

describe('getFileSize', () => {
  it('should return the correct file size', () => {
    const size = getFileSize(testFile);
    expect(size).toBe(Buffer.byteLength(testContent, 'utf-8'));
  });

  it('should return 0 for an empty file', () => {
    const size = getFileSize(emptyFile);
    expect(size).toBe(0);
  });

  it('should throw when file does not exist', () => {
    expect(() => getFileSize(nonExistentFile)).toThrow();
  });
});

// ── fileChunk ───────────────────────────────────────────────────────────────

describe('fileChunk', () => {
  const fileSize = Buffer.byteLength(testContent, 'utf-8');

  it('should return correct totalChunk when file is smaller than chunkSize', () => {
    const { totalChunk } = fileChunk(testFile, fileSize * 2);
    expect(totalChunk).toBe(1);
  });

  it('should return correct totalChunk when file is exactly chunkSize', () => {
    const { totalChunk } = fileChunk(testFile, fileSize);
    expect(totalChunk).toBe(1);
  });

  it('should return correct totalChunk when file spans multiple chunks', () => {
    const chunkSize = 10;
    const { totalChunk } = fileChunk(testFile, chunkSize);
    expect(totalChunk).toBe(Math.ceil(fileSize / chunkSize));
  });

  it('should return totalChunk = 0 for an empty file', () => {
    const { totalChunk } = fileChunk(emptyFile, 10);
    expect(totalChunk).toBe(0);
  });

  it('should read the first chunk correctly', () => {
    const chunkSize = 5;
    const { getChunk } = fileChunk(testFile, chunkSize);
    const stream = getChunk(1);

    return new Promise<void>((resolve, reject) => {
      let data = '';
      stream.on('data', (chunk: Buffer) => {
        data += chunk.toString('utf-8');
      });
      stream.on('end', () => {
        expect(data).toBe(testContent.slice(0, chunkSize));
        resolve();
      });
      stream.on('error', reject);
    });
  });

  it('should read the last chunk correctly', () => {
    const chunkSize = 10;
    const { getChunk, totalChunk } = fileChunk(testFile, chunkSize);
    const stream = getChunk(totalChunk);

    return new Promise<void>((resolve, reject) => {
      let data = '';
      stream.on('data', (chunk: Buffer) => {
        data += chunk.toString('utf-8');
      });
      stream.on('end', () => {
        const expectedStart = (totalChunk - 1) * chunkSize;
        expect(data).toBe(testContent.slice(expectedStart));
        resolve();
      });
      stream.on('error', reject);
    });
  });

  it('should read a middle chunk correctly', () => {
    const chunkSize = 5;
    const index = 2;
    const { getChunk, totalChunk } = fileChunk(testFile, chunkSize);
    // Only run if we have at least 2 chunks
    if (totalChunk < index) return;

    const stream = getChunk(index);

    return new Promise<void>((resolve, reject) => {
      let data = '';
      stream.on('data', (chunk: Buffer) => {
        data += chunk.toString('utf-8');
      });
      stream.on('end', () => {
        const expectedStart = (index - 1) * chunkSize;
        const expectedEnd = expectedStart + chunkSize;
        expect(data).toBe(testContent.slice(expectedStart, expectedEnd));
        resolve();
      });
      stream.on('error', reject);
    });
  });

  it('should throw when chunk index exceeds totalChunk', () => {
    const { getChunk, totalChunk } = fileChunk(testFile, 10);
    expect(() => getChunk(totalChunk + 1)).toThrow(
      `Chunk index must be between 1 and ${totalChunk}, got ${totalChunk + 1}`,
    );
  });

  it('should throw when chunk index is 0', () => {
    const { getChunk } = fileChunk(testFile, 10);
    expect(() => getChunk(0)).toThrow('Chunk index must be between 1 and');
  });

  it('should throw when chunk index is negative', () => {
    const { getChunk } = fileChunk(testFile, 10);
    expect(() => getChunk(-1)).toThrow('Chunk index must be between 1 and');
  });

  it('should throw when chunk index is not an integer', () => {
    const { getChunk } = fileChunk(testFile, 10);
    expect(() => getChunk(1.5)).toThrow('Chunk index must be between 1 and');
  });

  it('should throw when chunkSize is 0', () => {
    expect(() => fileChunk(testFile, 0)).toThrow('chunkSize must be a positive integer');
  });

  it('should throw when chunkSize is negative', () => {
    expect(() => fileChunk(testFile, -10)).toThrow('chunkSize must be a positive integer');
  });

  it('should throw when chunkSize is not an integer', () => {
    expect(() => fileChunk(testFile, 3.5)).toThrow('chunkSize must be a positive integer');
  });

  it('should throw when getting chunks from an empty file', () => {
    const { getChunk } = fileChunk(emptyFile, 10);
    expect(() => getChunk(1)).toThrow('Cannot read chunks from an empty file');
  });

  it('should throw for non-existent file', () => {
    expect(() => fileChunk(nonExistentFile, 10)).toThrow();
  });

  it('should reassemble to original content from all chunks', () => {
    const chunkSize = 7;
    const { getChunk, totalChunk } = fileChunk(testFile, chunkSize);

    const promises: Promise<string>[] = [];
    for (let i = 1; i <= totalChunk; i++) {
      promises.push(
        new Promise<string>((resolve, reject) => {
          let data = '';
          const stream = getChunk(i);
          stream.on('data', (chunk: Buffer) => {
            data += chunk.toString('utf-8');
          });
          stream.on('end', () => resolve(data));
          stream.on('error', reject);
        }),
      );
    }

    return Promise.all(promises).then((chunks) => {
      expect(chunks.join('')).toBe(testContent);
    });
  });

  it('should work with single-byte chunk size', () => {
    const chunkSize = 1;
    const { getChunk, totalChunk } = fileChunk(testFile, chunkSize);
    expect(totalChunk).toBe(fileSize);

    const stream = getChunk(1);
    return new Promise<void>((resolve, reject) => {
      let data = '';
      stream.on('data', (chunk: Buffer) => {
        data += chunk.toString('utf-8');
      });
      stream.on('end', () => {
        expect(data).toBe(testContent[0]);
        resolve();
      });
      stream.on('error', reject);
    });
  });
});

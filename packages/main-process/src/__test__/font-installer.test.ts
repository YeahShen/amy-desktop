import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { load as koffiLoad } from 'koffi';
import { installFont } from '../utils/font-installer';

// ── Mock 外部依赖 ────────────────────────────────────────────

vi.mock('node:child_process', () => ({
  execFile: vi.fn((_cmd: string, _args: string[], cb: (err: Error | null) => void) => cb(null)),
}));

vi.mock('electron', () => ({
  app: { isPackaged: false, getAppPath: () => '' },
}));

vi.mock('koffi', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 捕获 API 签名，供用例断言
  const func = vi.fn((_sig: string) => vi.fn(() => 1));
  return { load: vi.fn(() => ({ func })) };
});

const execFileMock = vi.mocked(execFile);
const koffiLoadMock = vi.mocked(koffiLoad);

// ── process.platform 模拟（测试后恢复原始描述符）────────────

const originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')!;

function setPlatform(platform: string) {
  Object.defineProperty(process, 'platform', { configurable: true, value: platform });
}

afterAll(() => {
  Object.defineProperty(process, 'platform', originalPlatform);
});

// ── 最小合法 TTF 构造（含 name 表）──────────────────────────

interface NameRecord {
  platformID: number;
  encodingID: number;
  nameID: number;
  text: string;
}

/** 构造一个仅含 name 表的最小合法 TTF（UTF-16BE 字符串） */
function buildTTF(nameRecords: NameRecord[]): Buffer {
  const count = nameRecords.length;
  const recordsSize = count * 12;
  const stringOffset = 6 + recordsSize;

  const table = Buffer.alloc(stringOffset + 64);
  table.writeUInt16BE(0, 0); // format
  table.writeUInt16BE(count, 2);
  table.writeUInt16BE(stringOffset, 4);

  let strPos = 0;
  nameRecords.forEach((record, i) => {
    const rec = 6 + i * 12;
    table.writeUInt16BE(record.platformID, rec);
    table.writeUInt16BE(record.encodingID, rec + 2);
    table.writeUInt16BE(0, rec + 4); // languageID
    table.writeUInt16BE(record.nameID, rec + 6);
    const text = Buffer.from(record.text, 'utf16le');
    text.swap16(); // Node 的 utf16le 是 LE，TTF name 表为 UTF-16BE
    table.writeUInt16BE(text.length, rec + 8);
    table.writeUInt16BE(strPos, rec + 10);
    text.copy(table, stringOffset + strPos);
    strPos += text.length;
  });

  const tableLength = stringOffset + strPos;
  const nameOffset = 28; // sfnt header(12) + 1 个表目录项(16)

  const file = Buffer.alloc(nameOffset + tableLength);
  file.writeUInt32BE(0x00010000, 0); // sfnt version
  file.writeUInt16BE(1, 4); // numTables
  file.writeUInt16BE(0, 6); // searchRange（解析器不读）
  file.writeUInt16BE(0, 8); // entrySelector
  file.writeUInt16BE(0, 10); // rangeShift
  file.write('name', 12, 'latin1'); // tag
  file.writeUInt32BE(0, 16); // checksum（解析器不校验）
  file.writeUInt32BE(nameOffset, 20);
  file.writeUInt32BE(tableLength, 24);
  table.copy(file, nameOffset);
  return file;
}

// ── 测试环境 ────────────────────────────────────────────────

let tmpDir = '';

function writeTTF(name: string, records: NameRecord[]) {
  const fontPath = path.join(tmpDir, name);
  fs.writeFileSync(fontPath, buildTTF(records));
  return fontPath;
}

beforeEach(() => {
  setPlatform('win32');
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'font-installer-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ── 用例 ────────────────────────────────────────────────────

describe('installFont 参数校验', () => {
  it('非字符串抛错', async () => {
    await expect(installFont('' as unknown as string)).rejects.toThrow(/非空字符串/);
  });

  it('非 .ttf 格式抛错', async () => {
    await expect(installFont(path.join(tmpDir, 'font.otf'))).rejects.toThrow(/仅支持 \.ttf/);
  });

  it('字体文件不存在抛错', async () => {
    await expect(installFont(path.join(tmpDir, 'nope.ttf'))).rejects.toThrow(/不存在/);
  });
});

describe('Windows 安装', () => {
  it('复制到用户字体目录 + 写注册表 + AddFontResourceW 立即注册', async () => {
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontPath = writeTTF('test.ttf', [{ platformID: 3, encodingID: 1, nameID: 1, text: 'TestFont' }]);

    await expect(installFont(fontPath)).resolves.toBe(true);

    // 1) 复制到 %LOCALAPPDATA%\Microsoft\Windows\Fonts
    const dest = path.join(tmpDir, 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts', 'test.ttf');
    expect(fs.existsSync(dest)).toBe(true);
    expect(fs.readFileSync(dest)).toEqual(fs.readFileSync(fontPath));

    // 2) reg.exe 写入 HKCU 注册表（值名/数据含空格，须自带引号）
    expect(execFileMock).toHaveBeenCalledWith(
      'reg',
      [
        'add',
        'HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts',
        '/v',
        '"TestFont (TrueType)"',
        '/t',
        'REG_SZ',
        '/d',
        '"test.ttf"',
        '/f',
      ],
      expect.any(Function),
    );

    // 3) koffi：gdi32.AddFontResourceW + user32.SendMessageTimeoutW
    expect(koffiLoadMock).toHaveBeenCalledTimes(2);
    expect(koffiLoadMock).toHaveBeenCalledWith('gdi32.dll');
    expect(koffiLoadMock).toHaveBeenCalledWith('user32.dll');
    const funcMock = (koffiLoadMock.mock.results[0]!.value as { func: ReturnType<typeof vi.fn> }).func;
    expect(funcMock).toHaveBeenCalledTimes(2);
    expect(funcMock).toHaveBeenCalledWith('int AddFontResourceW(str16 path)');
    expect(funcMock).toHaveBeenCalledWith(
      'intptr SendMessageTimeoutW(intptr hWnd, uint msg, intptr wParam, intptr lParam, uint fuFlags, uint uTimeout, intptr result)',
    );
  });

  it('nameID 16（Typographic Family）优先于 nameID 1', async () => {
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontPath = writeTTF('typo.ttf', [
      { platformID: 3, encodingID: 1, nameID: 1, text: 'Family' },
      { platformID: 3, encodingID: 1, nameID: 16, text: 'TypoFamily' },
    ]);

    await installFont(fontPath);

    expect(execFileMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(['/v', '"TypoFamily (TrueType)"']),
      expect.any(Function),
    );
  });

  it('解析中文家族名（UTF-16BE）', async () => {
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontPath = writeTTF('cn.ttf', [{ platformID: 3, encodingID: 1, nameID: 1, text: '测试字体' }]);

    await installFont(fontPath);

    expect(execFileMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(['/v', '"测试字体 (TrueType)"']),
      expect.any(Function),
    );
  });

  it('无 Unicode name 记录时回退文件名为字体名', async () => {
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontPath = writeTTF('fallback.ttf', [
      { platformID: 1, encodingID: 0, nameID: 1, text: 'MacName' }, // Mac Roman，不支持
    ]);

    await installFont(fontPath);

    expect(execFileMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(['/v', '"fallback (TrueType)"']),
      expect.any(Function),
    );
  });

  it('畸形 TTF（不足 12 字节）回退文件名且不抛错', async () => {
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontPath = path.join(tmpDir, 'broken.ttf');
    fs.writeFileSync(fontPath, Buffer.from([0, 1, 2]));

    await expect(installFont(fontPath)).resolves.toBe(true);

    expect(execFileMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining(['/v', '"broken (TrueType)"']),
      expect.any(Function),
    );
  });

  it('注册表写入失败时返回 false 并告警', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontPath = writeTTF('fail.ttf', [{ platformID: 3, encodingID: 1, nameID: 1, text: 'F' }]);

    execFileMock.mockImplementationOnce(
      ((_cmd: string, _args: string[], cb: (err: Error | null) => void) =>
        cb(new Error('denied'))) as never,
    );

    await expect(installFont(fontPath)).resolves.toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('注册表写入失败'));

    warnSpy.mockRestore();
  });
});

describe('幂等性（已安装则跳过）', () => {
  it('已安装（内容一致）时跳过注册表与 koffi 注册', async () => {
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontPath = writeTTF('test.ttf', [{ platformID: 3, encodingID: 1, nameID: 1, text: 'TestFont' }]);

    await installFont(fontPath);
    const execCalls = execFileMock.mock.calls.length;
    const koffiCalls = koffiLoadMock.mock.calls.length;
    expect(execCalls).toBeGreaterThan(0); // 首次安装执行了注册

    // 再次安装同一字体 → 跳过，无任何副作用
    await expect(installFont(fontPath)).resolves.toBe(true);
    expect(execFileMock.mock.calls.length).toBe(execCalls);
    expect(koffiLoadMock.mock.calls.length).toBe(koffiCalls);
  });

  it('同名字面但内容不同时覆盖并重新安装', async () => {
    vi.stubEnv('LOCALAPPDATA', path.join(tmpDir, 'AppData', 'Local'));
    const fontA = writeTTF('same.ttf', [{ platformID: 3, encodingID: 1, nameID: 1, text: 'VersionA' }]);
    await installFont(fontA);

    // 同名文件被替换为新内容（如字体更新）
    const fontB = writeTTF('same.ttf', [{ platformID: 3, encodingID: 1, nameID: 1, text: 'VersionB' }]);
    await expect(installFont(fontB)).resolves.toBe(true);

    // 目标文件被覆盖为新内容，且重新执行了注册
    const dest = path.join(tmpDir, 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts', 'same.ttf');
    expect(fs.readFileSync(dest)).toEqual(fs.readFileSync(fontB));
    expect(execFileMock).toHaveBeenCalledTimes(2);
  });

  it('Linux 已安装时跳过 fc-cache', async () => {
    setPlatform('linux');
    vi.stubEnv('XDG_DATA_HOME', path.join(tmpDir, 'xdg'));
    const fontPath = writeTTF('test.ttf', []);

    await installFont(fontPath);
    const execCalls = execFileMock.mock.calls.length;

    await expect(installFont(fontPath)).resolves.toBe(true);
    expect(execFileMock.mock.calls.length).toBe(execCalls);
  });
});

describe('Linux 安装', () => {
  it('复制到 XDG 字体目录并刷新 fc-cache', async () => {
    setPlatform('linux');
    vi.stubEnv('XDG_DATA_HOME', path.join(tmpDir, 'xdg'));
    const fontPath = writeTTF('test.ttf', []);

    await expect(installFont(fontPath)).resolves.toBe(true);

    const dest = path.join(tmpDir, 'xdg', 'fonts', 'test.ttf');
    expect(fs.existsSync(dest)).toBe(true);
    expect(execFileMock).toHaveBeenCalledWith('fc-cache', ['-f'], expect.any(Function));
    expect(execFileMock).not.toHaveBeenCalledWith('reg', expect.anything(), expect.any(Function));
  });

  it('无 XDG_DATA_HOME 时使用 ~/.local/share/fonts', async () => {
    setPlatform('linux');
    const fontPath = writeTTF('test.ttf', []);

    await installFont(fontPath);

    const dest = path.join(os.homedir(), '.local', 'share', 'fonts', 'test.ttf');
    expect(fs.existsSync(dest)).toBe(true);
    fs.rmSync(dest, { force: true }); // 清理测试产物，避免污染 home
  });
});

describe('不支持的平台', () => {
  it('darwin 返回 false 并告警', async () => {
    setPlatform('darwin');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fontPath = writeTTF('test.ttf', []);

    await expect(installFont(fontPath)).resolves.toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('不支持的平台'));

    warnSpy.mockRestore();
  });
});

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { app } from 'electron';

/** 仅支持 TrueType 字体 */
const TTF_EXT = '.ttf';

/** Windows 用户级字体目录（Win10 1809+，写入无需管理员权限） */
const WIN_USER_FONT_DIR = ['Microsoft', 'Windows', 'Fonts'] as const;
/** Windows 用户字体注册表键（HKCU，注册后重启仍生效） */
const WIN_FONT_REG_KEY = 'HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts';

/** HWND_BROADCAST：广播给所有顶层窗口 */
const HWND_BROADCAST = 0xffff;
/** WM_FONTCHANGE：字体变更通知 */
const WM_FONTCHANGE = 0x001d;
/** SMTO_ABORTIFHUNG：目标窗口卡死时放弃等待 */
const SMTO_ABORTIFHUNG = 0x0002;

/** 获取当前平台的用户级字体安装目录；不支持的平台返回 null */
function getUserFontDir(): string | null {
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    return localAppData ? path.join(localAppData, ...WIN_USER_FONT_DIR) : null;
  }

  if (process.platform === 'linux') {
    // XDG 约定：$XDG_DATA_HOME/fonts，默认 ~/.local/share/fonts（fontconfig 自动扫描）
    const dataHome = process.env.XDG_DATA_HOME ?? path.join(os.homedir(), '.local', 'share');
    return path.join(dataHome, 'fonts');
  }

  return null;
}

/**
 * 解析 TTF 的 name 表，提取字体家族名（Windows Unicode 编码的 nameID 16/1），失败返回 null。
 * TTF 结构：sfnt header → table directory（tag/offset/length）→ 'name' 表（UTF-16BE 字符串）。
 */
function parseTTFName(fontPath: string): string | null {
  const fd = fs.openSync(fontPath, 'r');
  try {
    const header = Buffer.alloc(12);
    if (fs.readSync(fd, header, 0, 12, 0) < 12) return null;

    const numTables = header.readUInt16BE(4);
    const fileSize = fs.fstatSync(fd).size;
    // 表目录必须完整落在文件内，防止畸形文件拖慢循环
    if (12 + numTables * 16 > fileSize) return null;

    for (let i = 0; i < numTables; i++) {
      const entry = Buffer.alloc(16);
      fs.readSync(fd, entry, 0, 16, 12 + i * 16);
      if (entry.toString('latin1', 0, 4) !== 'name') continue;

      const nameOffset = entry.readUInt32BE(8);
      const nameLength = entry.readUInt32BE(12);
      if (nameOffset + nameLength > fileSize || nameLength < 6) return null;

      const table = Buffer.alloc(nameLength);
      fs.readSync(fd, table, 0, nameLength, nameOffset);

      const count = table.readUInt16BE(2);
      const stringOffset = table.readUInt16BE(4);
      // nameID 16（Typographic Family）优先，回退 nameID 1（Font Family）
      for (const nameID of [16, 1]) {
        for (let j = 0; j < count; j++) {
          const rec = 6 + j * 12;
          if (rec + 12 > table.length) return null;

          const platformID = table.readUInt16BE(rec);
          const encodingID = table.readUInt16BE(rec + 2);
          if (table.readUInt16BE(rec + 6) !== nameID) continue;
          // 仅接受 Unicode 编码的 name 记录（Windows 3/1、3/10 或平台 0/3）
          const isUnicode =
            (platformID === 3 && (encodingID === 1 || encodingID === 10)) ||
            (platformID === 0 && encodingID === 3);
          if (!isUnicode) continue;

          const len = table.readUInt16BE(rec + 8);
          const off = table.readUInt16BE(rec + 10);
          const start = stringOffset + off;
          if (start + len > table.length) continue;

          // name 表字符串为 UTF-16BE，Node 的 utf16le 解码前先交换字节序
          const strBuf = Buffer.from(table.subarray(start, start + (len & ~1)));
          strBuf.swap16();
          const name = strBuf.toString('utf16le').replace(/\0/g, '').trim();
          if (name) return name;
        }
      }
      return null;
    }
  } finally {
    fs.closeSync(fd);
  }
  return null;
}

/**
 * 目标字体是否已安装：目标文件存在且与源内容一致（先比 size 避免大文件全量读取）。
 * 同名但内容不同的文件视为未安装，允许覆盖更新字体。
 */
function isFontInstalled(srcPath: string, destPath: string): boolean {
  if (!fs.existsSync(destPath)) return false;

  const srcStat = fs.statSync(srcPath);
  const destStat = fs.statSync(destPath);
  if (srcStat.size !== destStat.size) return false;

  return fs.readFileSync(srcPath).equals(fs.readFileSync(destPath));
}

/** 写入 HKCU 字体注册表项，返回是否成功（通过 reg.exe，免外部依赖） */
function registerWindowsFont(fileName: string, familyName: string) {
  return new Promise<boolean>((resolve) => {
    // reg.exe 对含空格的值名/数据需要自带引号（execFile 不经 shell，不会二次解析）
    const valueName = `"${familyName} (TrueType)"`;
    execFile(
      'reg',
      ['add', WIN_FONT_REG_KEY, '/v', valueName, '/t', 'REG_SZ', '/d', `"${fileName}"`, '/f'],
      (err) => resolve(!err),
    );
  });
}

/** 加载 koffi（打包态从 extraResource 目录 require，开发态走 ESM import） */
function loadKoffi(): Promise<typeof import('koffi')> {
  return new Promise((resolve) => {
    if (app.isPackaged) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- koffi 为 CJS 原生模块，打包后仅能通过 require 加载
      resolve(require(path.resolve(app.getAppPath(), '..', 'koffi/index.cjs')));
    } else {
      import('koffi').then(resolve);
    }
  });
}

/**
 * Windows：通过 GDI32 AddFontResourceW 立即注册字体（无需重启），
 * 并向所有窗口广播 WM_FONTCHANGE。失败仅告警——字体已落盘，
 * 重启后由注册表项生效。
 */
async function notifyWindowsFontChange(fontFilePath: string) {
  try {
    const koffi = await loadKoffi();
    const gdi32 = koffi.load('gdi32.dll');
    const user32 = koffi.load('user32.dll');

    const AddFontResourceW = gdi32.func('int AddFontResourceW(str16 path)');
    const SendMessageTimeoutW = user32.func(
      'intptr SendMessageTimeoutW(intptr hWnd, uint msg, intptr wParam, intptr lParam, uint fuFlags, uint uTimeout, intptr result)',
    );

    const added = AddFontResourceW(fontFilePath);
    SendMessageTimeoutW(HWND_BROADCAST, WM_FONTCHANGE, 0, 0, SMTO_ABORTIFHUNG, 1000, 0);
    if (added > 0) console.log(`installFont: 字体已注册，AddFontResourceW 返回 ${added}`);
  } catch (err) {
    console.warn('installFont: 字体立即生效通知失败（重启后仍会生效）:', err);
  }
}

/**
 * 安装字体到系统，支持 Windows / Linux。
 *
 * - Windows：复制到用户字体目录（%LOCALAPPDATA%\Microsoft\Windows\Fonts，免管理员权限），
 *   写 HKCU 注册表持久化，AddFontResourceW 立即生效
 * - Linux：复制到 XDG 字体目录（默认 ~/.local/share/fonts，fontconfig 自动扫描），
 *   fc-cache -f 刷新缓存
 * - 幂等：目标字体已安装（文件存在且内容一致）时跳过全部步骤
 *
 * @param fontPath 字体文件路径，仅支持 .ttf
 * @returns 是否安装成功；参数非法 / 文件不存在时抛 Error
 */
export async function installFont(fontPath: string): Promise<boolean> {
  // —— 参数校验 ——
  if (typeof fontPath !== 'string' || !fontPath.trim()) {
    throw new Error('installFont: fontPath 必须是非空字符串');
  }
  if (path.extname(fontPath).toLowerCase() !== TTF_EXT) {
    throw new Error(`installFont: 仅支持 .ttf 格式字体，收到: ${fontPath}`);
  }
  if (!fs.existsSync(fontPath)) {
    throw new Error(`installFont: 字体文件不存在: ${fontPath}`);
  }

  // —— 目标目录 ——
  const fontDir = getUserFontDir();
  if (!fontDir) {
    console.warn(`installFont: 不支持的平台 ${process.platform}（仅支持 win32 / linux）`);
    return false;
  }
  fs.mkdirSync(fontDir, { recursive: true });

  // —— 复制字体文件（同名覆盖，便于更新字体）——
  const fileName = path.basename(fontPath);
  const destPath = path.join(fontDir, fileName);

  // 幂等：目标已存在且内容一致 → 视为已安装，跳过复制与平台注册
  if (isFontInstalled(fontPath, destPath)) {
    console.log(`installFont: 字体已安装，跳过: ${fileName}`);
    return true;
  }

  fs.copyFileSync(fontPath, destPath);

  // —— 平台注册 ——
  if (process.platform === 'win32') {
    const familyName = parseTTFName(fontPath) ?? path.basename(fileName, TTF_EXT);
    const registered = await registerWindowsFont(fileName, familyName);
    await notifyWindowsFontChange(destPath);
    if (!registered) {
      console.warn('installFont: Windows 字体注册表写入失败，字体将在系统重启后生效');
    }
    return registered;
  }

  // Linux：刷新 fontconfig 缓存让新字体立即可用（失败无害，下次扫描会自动识别）
  execFile('fc-cache', ['-f'], () => {});
  return true;
}

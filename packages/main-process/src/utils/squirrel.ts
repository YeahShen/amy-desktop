import process from 'node:process';
import childProcess, { exec } from 'node:child_process';
import path from 'node:path';
import { app } from 'electron';

export async function handleSquirrelEvent() {
  if (process.platform !== 'win32') {
    return false;
  }

  const executeSquirrelCommand = (args: any) => {
    try {
      const updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
      const result = childProcess.spawnSync(updateExe, args);
      return result.status === 0;
    } catch (error) {
      console.error('Error executing Squirrel command:', error);
      return false;
    }
  };

  const squirrelEvent = process.argv[1];

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated': {
      // 安装或更新时创建快捷方式
      const a = executeSquirrelCommand(['--createShortcut', path.basename(process.execPath)]);

      // await deleteRightClickMenu();
      // await registerRightClickMenu();

      if (a) {
        app.quit();
        return true;
      }

      break;
    }
    case '--squirrel-uninstall':
      // await deleteRightClickMenu();
      if (executeSquirrelCommand(['--removeShortcut', path.basename(process.execPath)])) {
        app.quit();
        return true;
      }
      break;

    case '--squirrel-firstrun':
      return false;
    case '--squirrel-obsolete':
      app.quit();
      return true;
  }

  return false;
}

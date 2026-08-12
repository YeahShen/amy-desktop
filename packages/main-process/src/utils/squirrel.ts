import process from 'node:process';
import childProcess from 'node:child_process';
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

      // 字体安装失败只告警，不阻断安装流程
      try {
        await installFont(DEFAULT_FONT_TYPE);
      } catch (err) {
        console.error('安装默认字体失败（跳过）:', err);
      }

      executeSquirrelCommand(['--createShortcut', path.basename(process.execPath)]);

      // await deleteRightClickMenu();
      // await registerRightClickMenu();

      // Squirrel 事件处理完成必须退出，否则应用会继续正常启动流程，
      // 在安装器动画期间打开应用窗口
      app.quit();
      return true;
    }
    case '--squirrel-uninstall':
      // await deleteRightClickMenu();
      // 无论移除快捷方式成功与否都退出，避免应用正常启动
      executeSquirrelCommand(['--removeShortcut', path.basename(process.execPath)]);
      app.quit();
      return true;

    case '--squirrel-firstrun':
      return false;
    case '--squirrel-obsolete':
      app.quit();
      return true;
  }

  return false;
}

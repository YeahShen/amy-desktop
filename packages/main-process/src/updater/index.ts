import { updateElectronApp, UpdateSourceType } from './updater';
import log from 'electron-log';

const upgradeUrl = `http://47.112.7.167:8090/app/AMY STATIONS/`;

export function checkForUpdate() {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.StaticStorage,
      baseUrl: `${upgradeUrl}${process.platform}/${process.arch}`,
    },
    logger: log,
  });
}

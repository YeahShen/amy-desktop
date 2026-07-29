import { updateElectronApp, UpdateSourceType } from './updater';
import log from 'electron-log';

const upgradeUrl = `https://release.ashen-station.top/app/AMY STATIONS/`;

export function checkForUpdate() {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.StaticStorage,
      baseUrl: `${upgradeUrl}${process.platform}/${process.arch}`,
    },
    logger: log,
  });
}

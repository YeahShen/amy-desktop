// import { app, autoUpdater, dialog, Event } from 'electron';

// class Updater {
//   constructor() {}
// }

// export { Updater };

import process from 'node:process';
import log from 'electron-log';
import { updateElectronApp, UpdateSourceType } from 'update-electron-app';

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

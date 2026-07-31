import { updateElectronApp, UpdateSourceType } from './updater';
import log from 'electron-log';

export async function checkForUpdate() {
  const upgradeUrl = (await checkIPv6HTTP()) ? UPGRADE_IPV6_URL : UPGRADE_URL;

  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.StaticStorage,
      baseUrl: `${upgradeUrl}${process.platform}/${process.arch}`,
    },
    logger: log,
  });
}

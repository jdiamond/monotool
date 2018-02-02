// @flow

import readPkgUp from 'read-pkg-up';
import requireMainFilename from 'require-main-filename';

export default async function version() {
  console.log(`monotool v${getVersion()}`);

  return { ok: true };
}

export function getVersion() {
  try {
    const result = readPkgUp.sync({
      cwd: requireMainFilename(require),
      normalize: false,
    });

    return result.pkg.version || '<unknown>';
  } catch (noop) {
    return '<unknown>';
  }
}

// @flow

import { getVersion } from './version';

export default async function help() {
  showHelp();

  return { ok: true };
}

export function showHelp() {
  console.log(`monotool v${getVersion()}

Usage: monotool [options] command [arguments]

Commands:

  help           show help and exit
  install        install packages (in dependency order)
  list <target>  list local dependencies of target
  version        show version and exit

Options:

  -h/--help             show help and exit
  -p/--package-manager  set package manager (default: npm)
  -q/--quiet            show minimal output
  -v/--version          show version and exit

Examples:

  monotool install
  monotool -p yarn install
`);
}

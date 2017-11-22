#!/usr/bin/env node

// @flow

import readPkgUp from 'read-pkg-up';
import requireMainFilename from 'require-main-filename';
import getopts from 'getopts';
import * as commands from '../lib/commands';

function getVersion() {
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

async function main() {
  console.error(`monotool v${getVersion()}`);

  const opts = getopts(process.argv.slice(2), {
    boolean: ['dry-run'],
    default: {
      'dry-run': false,
      'package-manager': 'npm',
    },
    alias: {
      p: 'package-manager',
      n: 'dry-run',
    },
  });

  const cmd = opts._.shift();

  if (commands[cmd]) {
    return commands[cmd](opts);
  }

  return { ok: false, msg: `unknown command: ${cmd}` };
}

main()
  .then(result => {
    if (result.ok) {
      console.error('done');
    } else {
      console.error(result.msg);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

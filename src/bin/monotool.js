#!/usr/bin/env node

// @flow

import getopts from 'getopts';
import * as commands from '../lib/commands';

async function main() {
  const opts = getopts(process.argv.slice(2));

  const cmd = opts._.shift();

  if (commands[cmd]) {
    return commands[cmd](opts);
  }

  return { ok: false, msg: `unknown command: ${cmd}` };
}

main()
  .then(result => {
    if (result.ok) {
      console.log('done');
    } else {
      console.error(result.msg);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

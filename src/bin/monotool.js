#!/usr/bin/env node

// @flow

import getopts from 'getopts';
import * as commands from '../lib/commands';
import { showHelp } from '../lib/help';
import { getVersion } from '../lib/version';

async function main() {
  const opts = getopts(process.argv.slice(2), {
    alias: {
      h: 'help',
      n: 'dry-run',
      p: 'package-manager',
      q: 'quiet',
      v: 'version',
    },
    boolean: ['dry-run', 'help', 'quiet'],
    default: {
      'dry-run': false,
      help: false,
      'package-manager': 'npm',
      quiet: false,
      version: false,
    },
  });

  const cmd = opts._.shift();

  if (opts.help || cmd === 'help') {
    showHelp();
  } else if (opts.version || cmd === 'version') {
    console.log(`monotool v${getVersion()}`);
  } else {
    if (!opts.quiet) {
      console.error(`monotool v${getVersion()}`);
    }

    const result = await runCommand(cmd, opts);

    if (!result.ok) {
      if (!opts.quiet) {
        console.error('monotool: error');

        if (result.msg) {
          console.error(result.msg);
        }
      }

      process.exit(1);
    }

    if (!opts.quiet) {
      console.error('monotool: ok');
    }
  }
}

function runCommand(cmd, opts) {
  if (!commands[cmd]) {
    return { ok: false, msg: `unknown command: ${cmd}` };
  }

  return commands[cmd](opts).catch(err => ({
    ok: false,
    msg: err.msg || 'unexpected error',
  }));
}

main();

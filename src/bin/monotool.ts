#!/usr/bin/env node

import yargs from 'yargs';
import { default as install } from '../lib/install';
import { default as list } from '../lib/list';

const argv = yargs(process.argv.slice(2))
  .options({
    quiet: {
      describe: "Don't output messages",
      type: 'boolean',
      default: false,
      alias: 'q',
    },
  })
  .command(
    'install',
    'Install dependencies',
    (yargs) =>
      yargs.options({
        'dry-run': {
          describe: "Don't actually install",
          type: 'boolean',
          default: false,
          alias: 'n',
        },
        'package-manager': {
          describe: 'Package manager to use',
          type: 'string',
          default: 'npm',
          alias: 'p',
        },
      }),
    async (argv) => {
      return await install(argv);
    }
  )
  .command(
    'list [target]',
    'List packages',
    (yargs) =>
      yargs
        .options({
          items: {
            describe: 'List item type',
            choices: ['dirs', 'files', 'names'],
            default: 'dirs',
            alias: 'i',
          },
          absolute: {
            describe: 'Absolute paths',
            type: 'boolean',
            default: false,
            alias: 'a',
          },
        })
        .positional('target', {
          describe: 'Target package name',
          type: 'string',
          default: null,
        }),
    async (argv) => {
      return await list(argv);
    }
  )
  .onFinishCommand(async (result) => {
    if (!result.ok) {
      if (!argv.quiet) {
        console.error(result.message);
      }

      yargs.exit(1, new Error(result.message));
    }
  }).argv;

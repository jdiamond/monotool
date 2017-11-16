// @flow

import { dirname } from 'path';
import spawn_ from 'cross-spawn';
import { findPackages, buildGraph, overallOrder } from './packages';

function spawn(command, args, options) {
  return new Promise((resolve, reject) =>
    spawn_(command, args, options)
      .on('exit', resolve)
      .on('error', reject)
  );
}

type Opts = {
  _: string[],
  'dry-run': boolean,
};

export default async function install(opts: Opts) {
  const packages = await findPackages(opts._[0]);
  const graph = buildGraph(packages);

  for (const pkg of overallOrder(packages, graph)) {
    const cwd = dirname(pkg.path);

    console.log(`running npm install in ${cwd}`);

    if (!opts['dry-run']) {
      await spawn('npm', ['install'], { env: process.env, cwd, stdio: 'inherit' });
    }
  }

  return { ok: true };
}

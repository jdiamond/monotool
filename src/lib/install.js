// @flow

import { dirname } from 'path';
import { findPackages, buildGraph, overallOrder } from './packages';
import spawn from './spawn';

type Opts = {
  'dry-run': boolean,
};

export default async function install(opts: Opts) {
  const packages = await findPackages();
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

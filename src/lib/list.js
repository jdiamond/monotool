// @flow

import { dirname } from 'path';
import { findPackages, buildGraph, dependenciesOf, overallOrder } from './packages';

type Opts = {
  _: string[],
};

export default async function list(opts: Opts) {
  const packages = await findPackages();
  const graph = buildGraph(packages);

  const target = opts._[0];

  const pkgs = target ? dependenciesOf(target, packages, graph) : overallOrder(packages, graph);

  for (const pkg of pkgs) {
    console.log(dirname(pkg.path));
  }

  return { ok: true };
}

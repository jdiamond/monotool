// @flow

import { dirname } from 'path';
import { findPackages, buildGraph, overallOrder } from './packages';

export default async function list() {
  const packages = await findPackages();
  const graph = buildGraph(packages);

  for (const pkg of overallOrder(packages, graph)) {
    console.log(dirname(pkg.path));
  }

  return { ok: true };
}

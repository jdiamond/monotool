// @flow

import { readFile as readFile_ } from 'fs';
import { dirname, join } from 'path';
import { promisify } from 'util';
import glob_ from 'glob';
import { DepGraph } from 'dependency-graph';
import pMap from 'p-map';
import readPkgUp from 'read-pkg-up';

const readFile = promisify(readFile_);
const glob = promisify(glob_);

const DEPENDENCY_TYPES = ['dependencies', 'devDependencies'];

type Pkg = {
  path: string,
  pkg: {
    name: string,
    dependencies: any,
    devDependencies: any,
  },
};

type Graph = {
  addNode: (string, Pkg) => mixed,
  addDependency: (string, string) => mixed,
  getNodeData: string => Pkg,
  dependenciesOf: string => string[],
  overallOrder: () => string[],
};

export async function findPackages() {
  const root = await readPkgUp();
  const pattern = join(root.pkg.packages || 'packages/*', 'package.json');
  const packages = await glob(pattern, {
    cwd: dirname(root.path),
    absolute: true,
  });

  return pMap(packages, async path => ({
    path,
    pkg: JSON.parse(await readFile(path, 'utf8')),
  }));
}

export function buildGraph(packages: Pkg[]) {
  const graph: Graph = new DepGraph();

  for (const { path, pkg } of packages) {
    // console.error(`adding package ${pkg.name}`);

    graph.addNode(pkg.name, { path, pkg });
  }

  for (const { pkg } of packages) {
    // console.error(`finding dependencies for ${pkg.name}`);

    for (const dependencyType of DEPENDENCY_TYPES) {
      const deps = Object.keys(pkg[dependencyType] || {})
        .map(key => {
          const val = pkg[dependencyType][key];

          if (!val.startsWith('file:..')) {
            return null;
          }

          return key;
        })
        .filter(Boolean);

      for (const dep of deps) {
        graph.addDependency(pkg.name, dep);
      }
    }
  }

  return graph;
}

export function dependenciesOf(name: string, packages: Pkg[], graph: Graph) {
  return graph.dependenciesOf(name).map(name => graph.getNodeData(name));
}

export function overallOrder(packages: Pkg[], graph: Graph) {
  return graph.overallOrder().map(name => graph.getNodeData(name));
}

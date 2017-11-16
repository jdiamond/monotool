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
  json: {
    name: string,
    dependencies: any,
    devDependencies: any,
  },
};

type Graph = {
  addNode: Function,
  addDependency: Function,
  getNodeData: Function,
  overallOrder: Function,
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
    json: JSON.parse(await readFile(path, 'utf8')),
  }));
}

export function buildGraph(packages: Pkg[]) {
  const graph: Graph = new DepGraph();

  for (const pkg of packages) {
    // console.log(`adding package ${pkg.json.name}`);

    graph.addNode(pkg.json.name, pkg);
  }

  for (const pkg of packages) {
    // console.log(`finding dependencies for ${pkg.json.name}`);

    for (const dependencyType of DEPENDENCY_TYPES) {
      const deps = Object.keys(pkg.json[dependencyType] || {})
        .map(key => {
          const val = pkg.json[dependencyType][key];

          if (!val.startsWith('file:..')) {
            return null;
          }

          return key;
        })
        .filter(Boolean);

      for (const dep of deps) {
        graph.addDependency(pkg.json.name, dep);
      }
    }
  }

  return graph;
}

export function overallOrder(packages: Pkg[], graph: Graph) {
  return graph.overallOrder().map(name => graph.getNodeData(name));
}

import { readFile as readFile_ } from 'fs';
import { dirname, join, resolve } from 'path';
import { promisify } from 'util';
import glob_ from 'glob';
import { DepGraph } from 'dependency-graph';
import pMap from 'p-map';
import readPkgUp from 'read-pkg-up';

const readFile = promisify(readFile_);
const glob = promisify(glob_);

type Pkg = {
  path: string;
  pkg: {
    name: string;
    dependencies: { [key: string]: string };
    devDependencies: { [key: string]: string };
  };
};

type Args = {
  absolute: boolean;
};

export async function findPackages(args?: Args) {
  const root = await readPkgUp();

  if (!root) {
    throw new Error('cannot find root package');
  }

  const rootDir = dirname(root.path);

  const patterns = root.packageJson.workspaces ||
    root.packageJson.packages || ['packages/*'];

  const packages = [];

  for (const pattern of patterns) {
    for (const path of await glob(join(pattern, 'package.json'), {
      cwd: rootDir,
      absolute: args?.absolute,
    })) {
      packages.push(path);
    }
  }

  return {
    root,
    npmWorkspaces: Boolean(root.packageJson.workspaces),
    packages: await pMap(packages, async (path) => ({
      path,
      pkg: JSON.parse(await readFile(resolve(rootDir, path), 'utf8')),
    })),
  };
}

export function buildGraph(packages: Pkg[]) {
  const graph = new DepGraph<Pkg>();

  for (const { path, pkg } of packages) {
    // console.error(`adding package ${pkg.name}`);

    graph.addNode(pkg.name, { path, pkg });
  }

  for (const { pkg } of packages) {
    // console.error(`finding dependencies for ${pkg.name}`);

    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    const deps = Object.keys(allDeps)
      .map((key) => {
        const val = allDeps[key];

        if (!graph.hasNode(key) && !val.startsWith('file:..')) {
          return null;
        }

        return key;
      })
      .filter(Boolean);

    for (const dep of deps) {
      graph.addDependency(pkg.name, dep!);
    }
  }

  return graph;
}

export function dependenciesOf(name: string, graph: DepGraph<Pkg>) {
  return graph
    .dependenciesOf(name)
    .concat(name)
    .map((name) => graph.getNodeData(name));
}

export function overallOrder(graph: DepGraph<Pkg>) {
  return graph.overallOrder().map((name) => graph.getNodeData(name));
}

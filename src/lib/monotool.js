// @flow

import { readFile as readFile_ } from 'fs';
import { join, dirname } from 'path';
import { spawn as spawn_ } from 'child_process';
import { promisify } from 'util';
import glob_ from 'glob';
import { DepGraph } from 'dependency-graph';
import pMap from 'p-map';

const readFile = promisify(readFile_);
const glob = promisify(glob_);

const DEPENDENCY_TYPES = ['dependencies', 'devDependencies'];

async function findPackages(dir) {
  const packages = await glob(join(dir, '*', 'package.json'), { absolute: true });

  return pMap(packages, async path => ({
    path,
    json: JSON.parse(await readFile(path, 'utf8')),
  }));
}

function buildGraph(packages) {
  const graph = new DepGraph();

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

function spawn(command, args, options) {
  return new Promise((resolve, reject) =>
    spawn_(command, args, options)
      .on('exit', resolve)
      .on('error', reject)
  );
}

function install(pkg) {
  const cwd = dirname(pkg.path);

  console.log(`running npm install in ${cwd}`);

  return spawn('npm', ['install'], { env: process.env, cwd, stdio: 'inherit' });
}

export default async function main(opts: { _: string[] }) {
  const cmd = opts._.shift();

  if (cmd === 'install') {
    const packages = await findPackages(opts._[0]);

    const graph = buildGraph(packages);

    for (const name of graph.overallOrder()) {
      const pkg = graph.getNodeData(name);
      await install(pkg);
    }

    return { ok: true };
  } else {
    return { ok: false, msg: `unknown command: ${cmd}` };
  }
}

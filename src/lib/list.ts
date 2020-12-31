import { dirname, resolve } from 'path';
import {
  findPackages,
  buildGraph,
  dependenciesOf,
  overallOrder,
} from './packages';

type Args = {
  target: string | null;
  items: string;
  absolute: boolean;
};

export default async function list(args: Args) {
  const { root, packages } = await findPackages(args);
  const graph = buildGraph(packages);

  let target = args.target;

  if (target) {
    // First, try to find by exact package name.
    if (!graph.hasNode(target)) {
      const targetPath = resolve(dirname(root.path), target);

      const found = packages.find((pkg) => {
        // Second, try to find by short package name (after the "@scope/").
        if (pkg.pkg.name.endsWith(`/${target}`)) {
          return true;
        }

        const thisPath = resolve(dirname(root.path), pkg.path);

        // Third, try to find by directory or file path.
        return thisPath === targetPath || dirname(thisPath) === targetPath;
      });

      if (found) {
        target = found.pkg.name;
      } else {
        return { ok: false, message: `could not find target ${target}` };
      }
    }
  }

  const pkgs = target ? dependenciesOf(target, graph) : overallOrder(graph);

  for (const pkg of pkgs) {
    if (args.items === 'dirs') {
      console.log(dirname(pkg.path));
    } else if (args.items === 'files') {
      console.log(pkg.path);
    } else if (args.items === 'names') {
      console.log(pkg.pkg.name);
    }
  }

  return { ok: true };
}

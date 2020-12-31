import { dirname } from 'path';
import { findPackages, buildGraph, overallOrder } from './packages';
import spawn from './spawn';

type Args = {
  quiet: boolean;
  'dry-run': boolean;
  'package-manager': string;
};

export default async function install(args: Args) {
  const { npmWorkspaces, packages } = await findPackages();

  if (npmWorkspaces) {
    return {
      ok: false,
      message: 'use `npm install` when npm workspaces are configured',
    };
  }

  const graph = buildGraph(packages);

  for (const pkg of overallOrder(graph)) {
    const cwd = dirname(pkg.path);

    if (!args.quiet) {
      console.error(`running npm install in ${cwd}`);
    }

    if (!args['dry-run']) {
      await spawn(args['package-manager'], ['install'], {
        env: process.env,
        cwd,
        stdio: 'inherit',
      });
    }
  }

  return { ok: true };
}

# monotool

A tool to manage monorepos with npm (with or without npm workspaces in npm v7).

## Local Packages

For the purpose of this documentation, a "local package" is a folder in the
monorepo containing a package.json file. By default, those folders must be a
sub-folder of "packages", but that can be changed.

Each package.json file can contain a name that doesn't exactly match the folder
name. For example, the package.json file in "packages/a" might have a `name` of
"@my-org/a".

When not using npm workspaces (added in npm v7), local packages reference each
other with `file:..` URLs in their package.json dependencies. For example, if
"packages/a" depends on "packages/b", the package.json in "packages/a" would
contain a dependency that looks like `"@my-org/b": "file:../b"`.

When using npm workspaces in npm v7, local package dependecies can use version
ranges or even "*" like `"@my-org/b": "*"`.

Local packages can, of course, reference any package on npm or elsewhere as any
normal Node.js project would.

If not using npm workspaces, add `"packages"` to your root package.json to
indicate where to look for local packages. The default is `["packages/*"]`. Then
you would run `monotool install` which will run `npm install` in each package
directory.

If using npm workspaces, use `"workspaces"` instead of `"packages"`. Then you
would run `npm install` from the root directory. Other commands like `monotool
list` might still be useful and are safe to run without interfering with npm.

## Commands

### install

```
monotool install
```

Runs `npm install` for each local package.

It will install in dependency order so that any postinstall or prepare scripts
can run before their dependents need them.

Do not use this command if you are using npm workspaces.

### list

```
monotool list [target]
```

Lists local packages in dependency order. By default, the relative path to each
directory is printed. That can be changed by using `-i files` or `-i names` to
print the paths to the package.json files or the actual package names. To print
absolute paths, use `-a`.

When no target is specified, all local packages are output. When a target is
specified, only dependencies of that target (and itself) are output.

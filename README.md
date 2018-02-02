# monotool

A tool to manage monorepos.

## Local Packages

For the purpose of this documentation, a "local package" is a folder in the
monorepo containing a package.json file. By default, those folders must be a
sub-folder of "packages", but that can be changed.

Local packages reference each other with `file:..` URLs in their package.json
dependencies. For example, if "packages/a" depends on "packages/b", the
package.json in "packages/a" would contain a dependency that looks like `"b":
"file:../b"`.

Local packages can, of course, reference any package on npm or elsewhere as any
normal Node.js project would.

Local packages are not assumed to be published to npm.

Add `"packages"` to your root package.json to indicate where to look for
local packages. The default is `"packages/*"`.

## Example

```
.
├── package.json
└── packages
    ├── a
    │   └── package.json
    ├── b
    │   └── package.json
    └── c
        └── package.json
```

## npm or yarn

Monotool can spawn either npm or yarn, but it was really designed to be used
with npm and not yarn.

The difference between npm and yarn with respect to `file:..` URLs is that npm
(starting in v5) creates links on your file system making it much easier for
tools like [nodemon](https://nodemon.io/) to detect when dependencies change
while developing.

If you really want to use yarn, use the `-p yarn` option when invoking monotool.

## Commands

### install

```
monotool install
```

Runs `npm install` in each folder containing a package.json file.

It does not hoist common modules.

### list

```
monotool list [target]
```

Lists local projects in dependency order.

If a target is specified, only list dependencies of that target.

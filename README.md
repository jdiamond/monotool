# monotool

A tool to manage monorepos.

Packages in the monorepo that reference each other do so with `file:..` URLs in
their package.json files.

Add `"packages"` to your root package.json to indicate where to look for
packages. The default is `"packages/*"`.

## Commands

### install

```
monotool install
```

Runs `npm install` in each folder containing a package.json file.

It does not hoist common modules.

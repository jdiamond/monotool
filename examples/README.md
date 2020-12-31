There are two examples in this directory that look like this:

```
.
├── package.json
└── projects
    ├── api-server
    │   └── package.json
    ├── db
    │   └── package.json
    ├── utils
    │   └── package.json
    ├── web-app
    │   └── package.json
    └── web-components
        └── package.json
```

The npm6 directory contains an example monorepo using npm v6 or v7 without npm
workspaces.

The npm7 directory uses npm workspaces and requires npm v7.

The projects don't have any real code in them, but are named to emulate a "real
world" monorepo.

Two of the projects are "deployable": api-server and web-app.

api-server is a Node.js project that uses Express. It depends on db and utils.

web-app is a project created with Create React App. It depends on
web-components.

db is a package only meant to be used in Node.js environments because it
communicates with a database. It depends on utils.

web-components is a library of UI components meant for use in React
applications. It depends on utils.

utils is a generic JavaScript library that can run in both Node.js and browsers.
It has no local dependencies.

When working on api-server, I want changes to the source code in the api-server
project to trigger a rebuild/reload. Since api-server depends on db and utils, I
want changes in either of those projects to also trigger a rebuild/reload of
api-server.

When I'm ready to deploy a new version of api-server, I want my CI server to do
a full rebuild of utils, db, and api-server (in that order).

I want a similar workflow when working on web-app except its only local package
dependency is web-components (which depends on utils which means web-app
indirectly depends on utils).

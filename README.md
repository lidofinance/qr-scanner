# QR Scanner

## Install Dependency for Bundling

```shell
npm i
or
yarn
```

## Bundle

Already-built index.html is committed to the repo, but if you make some changes in src/ run:

```shell
npm run bundle
or
yarn bundle
```

## Update Dependencies

Vue, adapter and instascan are committed to the repo and their versions are fixed in updatelibs.sh, but if you wish to refetch them, just run:

```shell
npm run updatelibs
or
yarn updatelibs
```

## DOS newlines error

On your machine you may face this error:

```shell
env: node\r: No such file or directory
```

To fix it install dos2unix, eg for Mac:

```shell
brew install dos2unix
```

And run:

```shell
find node_modules/inline-scripts -type f -print0 | xargs -0 dos2unix
```

Note: Fixes will be overwritten on updates

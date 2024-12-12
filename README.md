# :baby_bottle:&nbsp;&nbsp;Milkdown-Nota

[![ci][ci-badge]][ci-link]
![ts][ts-badge]
[![download-badge]][download-link]
![version][version-badge]
[![discord-badge]][discord-link]
![commit][commit-badge]
![license][license-badge]

<div align="center">
  <img src="/assets/logo.svg" />
  <img src="/assets/nota.png" />
</div>

A Milkdown fork for [Nota](https://www.nota-sync.com/) application.

# How to develop

first, you need to download `pnpm` package manager.<br>
You can download it from [here](https://pnpm.io/installation).

```sh
# Install dependencies
pnpm install

# build packages
pnpm run build:packs
```

# Documentation of Original Milkdown

For more information, please check our [official documentation website](https://milkdown.dev/).

# License

[MIT](/LICENSE)

[ci-badge]: https://github.com/Milkdown/milkdown/actions/workflows/ci.yml/badge.svg
[ci-link]: https://github.com/Milkdown/milkdown/actions/workflows/ci.yml
[ts-badge]: https://badgen.net/badge/-/TypeScript/blue?icon=typescript&label
[download-badge]: https://img.shields.io/npm/dm/@milkdown/core
[download-link]: https://www.npmjs.com/search?q=%40milkdown
[version-badge]: https://img.shields.io/npm/v/@milkdown/core
[commit-badge]: https://img.shields.io/github/commit-activity/m/Milkdown/milkdown
[license-badge]: https://img.shields.io/github/license/Milkdown/milkdown
[discord-badge]: https://img.shields.io/discord/870181036041060352
[discord-link]: https://discord.gg/SdMnrSMyBX

## Memo

- `prosemirror-table` and `prosemirror-view` had dependency conflict, so I set the version of `prosemirror-table` to `1.36.0` in `package.json` as workaround.
- solved `node_modules/minimatch/dist/cjs/index"' has no exported member named 'IMinimatch'. Did you mean 'Minimatch'?`
  - added `overrides` in `package.json` (ref: https://stackoverflow.com/questions/76012669/node-modules-minimatch-dist-cjs-index-has-no-exported-member-named-iminimatch/77810047#77810047)

```sh
"overrides": {
  "minimatch": "5.1.2",
  "glob": "8.1.0"
},

```

- `rimraf` and `glob` had dependency conflict, so I set the version of `rimraf` to `^11.0.0` in `package.json` as workaround.
- `glob` and `minimatch` had dependency conflict, so I set the version of `minimatch` to `^10.0.0` in `package.json` as workaround.
- update package names
  - `@milkdown/kit` -> `@milkdown-nota/kit`
  - `@milkdown/crepe` -> `@milkdown-nota/crepe`
  - `@milkdown/react` -> `@milkdown-nota/react`

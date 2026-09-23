---
'@milkdown/components': patch
'@milkdown/core': patch
'@milkdown/crepe': patch
'@milkdown/ctx': patch
'@milkdown/exception': patch
'@milkdown/kit': patch
'@milkdown/plugin-automd': patch
'@milkdown/plugin-block': patch
'@milkdown/plugin-clipboard': patch
'@milkdown/plugin-collab': patch
'@milkdown/plugin-cursor': patch
'@milkdown/plugin-diff': patch
'@milkdown/plugin-emoji': patch
'@milkdown/plugin-highlight': patch
'@milkdown/plugin-history': patch
'@milkdown/plugin-indent': patch
'@milkdown/plugin-listener': patch
'@milkdown/plugin-prism': patch
'@milkdown/plugin-slash': patch
'@milkdown/plugin-streaming': patch
'@milkdown/plugin-tooltip': patch
'@milkdown/plugin-trailing': patch
'@milkdown/plugin-upload': patch
'@milkdown/preset-commonmark': patch
'@milkdown/preset-gfm': patch
'@milkdown/prose': patch
'@milkdown/react': patch
'@milkdown/theme-nord': patch
'@milkdown/transformer': patch
'@milkdown/utils': patch
'@milkdown/vue': patch
---

Milkdown patch version release.

## Feat

- feat(preset-commonmark): make block container types extensible via ctx (#2465)

## Fix

- fix(ctx): clear the timeout when a timer settles (#2473)
- fix: keep user-authored inline br when loading markdown (#2463)
- fix(plugin-streaming): parse inline math in streamed content (#2464)

## Chore

- chore: bump up all dependencies (#2459)
- chore: bump up prosemirror-highlight version to ^0.16.0 (#2460)
- chore: bump up vitest version to v4.1.11 [SECURITY] (#2474)

## Docs

- docs: apply a comment writing standard across the repo (#2468)

## Test

- test(preset-commonmark): pin fragment serialization semantics (#2466)

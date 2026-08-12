---
'@milkdown/components': patch
'@milkdown/core': patch
'@milkdown/crepe': patch
'@milkdown/ctx': patch
'@milkdown/exception': patch
'@milkdown/react': patch
'@milkdown/vue': patch
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
'@milkdown/theme-nord': patch
'@milkdown/prose': patch
'@milkdown/transformer': patch
'@milkdown/utils': patch
---

Milkdown patch version release.

## Fix

- fix(components): sync readonly code block updates (#2455)
- fix: keep the dragged node on view.dragging when using the block handle (#2452)
- fix(preset-commonmark): make the inline code mark not inclusive (#2451)
- fix(prose): respect inline code in mark input rules (#2445)

## Chore

- chore: Lock file maintenance (#2453)
- chore: bump up pkg-pr-new version to ^0.0.87 (#2450)
- chore: bump up dompurify version to v3.4.13 [SECURITY] (#2448)
- chore: bump up all non-major dependencies (#2444)
- chore: bump up pnpm to v11.19.0 (#2443)

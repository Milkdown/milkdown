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
'@milkdown/plugin-diagram': patch
'@milkdown/plugin-emoji': patch
'@milkdown/plugin-history': patch
'@milkdown/plugin-indent': patch
'@milkdown/plugin-listener': patch
'@milkdown/plugin-prism': patch
'@milkdown/plugin-slash': patch
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

Release milkdown patch version.

## Feat

- feat: make integrations accept crepe editor (#1649)
- feat: add crepe ctx to make users can access crepe from editor (#1648)

## Fix

- fix: 🐛 incompatibility between Promise.resolve and angular change detection mechanism (#1647)
- fix: 🐛 remark transform error when no code block lang (#1642)

## Chore

- chore: bump up tailwindcss version to v4 (#1638)
- chore: bump up all non-major dependencies to v20.4.0 (#1646)
- chore: Lock file maintenance (#1645)
- chore: bump up all non-major dependencies to v20.3.3 (#1641)
- chore: bump up vite version to v6.0.9 [SECURITY] (#1636)
- chore: bump up shiki version to v2 (#1634)
- chore: Lock file maintenance (#1633)
- chore: bump up all non-major dependencies to v20.3.2 (#1632)
- chore: bump up katex version to v0.16.21 [SECURITY] (#1631)


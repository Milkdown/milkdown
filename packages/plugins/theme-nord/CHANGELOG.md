# @milkdown/theme-nord

## 7.6.2

### Patch Changes

- 061f740: Release milkdown patch version.

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

## 7.6.1

### Patch Changes

- 31da7f9: Fix nord theme.

  ## Fix

  - fix: 🐛 theme nord css generated file (#1629)

## 7.6.0

### Minor Changes

- 9421082: Minor version release for milkdown.

  ## Feat

  - feat: 🎸 add `on` api for crepe (#1622)
  - feat: add markdown inspector in storybook (#1619)
  - feat: add latex feature for crepe (#1613)

  ## Chore

  - chore: use kit in integrations (#1626)
  - chore: bump prosemirror versions (#1621)
  - chore: remove math plugin since we provides latex in crepe (#1617)
  - chore: remove husky install since it's deprecated (#1616)

## 7.5.9

### Patch Changes

- a3dde0c: Enable image proxy.

## 7.5.8

### Patch Changes

- db4ec60: Bug fixes and api improvements.

  # Crepe

  - Add image proxy config.
  - Fix link preview text not properly truncated.
  - Fix list item unstable selection.
  - Fix button types.
  - Reset index when slash menu out of bound.

  # Core

  - Prevent duplicate ids in the editor.
  - Allow options to floating ui.
  - Add undoable input rules.

## 7.5.0

### Minor Changes

- be28e7b: All in one kit package and crepe config.

  - Add all-in-one kit package.
  - Add crepe config for:
    - Widgets texts
    - Icons
  - Add new frame theme for crepe.
  - Add new table component.
  - Add GFM support for crepe.

## 7.4.0

### Minor Changes

- 849669b: ## Headless components and Crepe polish

  ### Feature

  #### Migrate from tippy to floating ui

  - feat: replace tippy with floating ui in plugin block in https://github.com/Milkdown/milkdown/pull/1356
  - feat: migrate tippy to floating ui in plugin slash in https://github.com/Milkdown/milkdown/pull/1375
  - feat: add offset for floating ui in https://github.com/Milkdown/milkdown/pull/1384
  - feat: migrate to floating ui in plugin tooltip in https://github.com/Milkdown/milkdown/pull/1373

  #### Components Improvements

  - feat: optimize code block behavior in https://github.com/Milkdown/milkdown/pull/1388
  - fix: image caption bug in https://github.com/Milkdown/milkdown/pull/1382
  - fix: list item block should respect readonly mode in https://github.com/Milkdown/milkdown/pull/1339
  - feat: remove styles in components in https://github.com/Milkdown/milkdown/pull/1346
  - feat: optimize block handle in https://github.com/Milkdown/milkdown/pull/1355
  - fix: slash menu scroll behavior in https://github.com/Milkdown/milkdown/pull/1386

  #### Crepe Improvements

  - feat: add better readonly support for crepe in https://github.com/Milkdown/milkdown/pull/1322
  - feat: add components in storybook in https://github.com/Milkdown/milkdown/pull/1323
  - fix: crepe destroy throw an error in https://github.com/Milkdown/milkdown/pull/1305
  - fix: improve styles for crepe in https://github.com/Milkdown/milkdown/pull/1306
  - feat: optimize ui for crepe theme in https://github.com/Milkdown/milkdown/pull/1383
  - feat: polish crepe image component ui in https://github.com/Milkdown/milkdown/pull/1385
  - feat: better drop cursor for crepe in https://github.com/Milkdown/milkdown/pull/1378
  - feat: migrate crepe theme to pure css in https://github.com/Milkdown/milkdown/pull/1358

  #### Misc

  - docs: update default config reference by @emmanuel-ferdman in https://github.com/Milkdown/milkdown/pull/1320
  - chore: remove copyright in https://github.com/Milkdown/milkdown/pull/1321
  - test: add list item block in stories in https://github.com/Milkdown/milkdown/pull/1338
  - chore: add inline image block in storybook in https://github.com/Milkdown/milkdown/pull/1340
  - chore: add link tooltip in storybook in https://github.com/Milkdown/milkdown/pull/1341
  - chore: add listener plugin in storybook in https://github.com/Milkdown/milkdown/pull/1342
  - fix: image block style offset in storybook in https://github.com/Milkdown/milkdown/pull/1345
  - chore: 🤖 adjust script names in https://github.com/Milkdown/milkdown/pull/1348
  - chore: adjust e2e folder in https://github.com/Milkdown/milkdown/pull/1354
  - chore: adjust folders in https://github.com/Milkdown/milkdown/pull/1357
  - chore: improve styles in story book in https://github.com/Milkdown/milkdown/pull/1359
  - fix: ordered list paste becomes unordered list in https://github.com/Milkdown/milkdown/pull/1368
  - feat: optimize storybook in https://github.com/Milkdown/milkdown/pull/1369
  - ci: use core pack in https://github.com/Milkdown/milkdown/pull/1387

## 7.3.6

### Patch Changes

- 151b789: Bug fix

## 7.3.5

### Patch Changes

- c2a5bcb: Resolve the tippy warning

## 7.3.4

### Patch Changes

- 2bca917: Fix some bugs and prepare for crepe editor.

## 7.3.3

### Patch Changes

- 2770d92: Add inline image component and link tooltip component

## 7.3.2

### Patch Changes

- 5c4a7571: Fix package issues

## 7.3.1

### Patch Changes

- f199e63f: Add code block and list item block in components

## 7.3.0

### Minor Changes

- 971ff4c0: Improvement features and bug fix.

  Add support for remark plugin config. (#1085)

  Add support for escape character in inline sync plugin. (#1094)

  Fix missing type error in theme nord. (#1095)

## 7.2.4

### Patch Changes

- 37b2f22a: Bug fix.

  Expose trigger key for slash plugin. (#1018)

  Fix heading commands for h4-h6. (#1033)

  Rollback to toggle mark command. (#1035)

  Fix the issue that commands not work for multi editor instances. (#1038)

  Fix the issue that marks won't be extends when pasting pure text from HTML. (#1040)

  Bump prosemirror versions. (#1041)

## 7.2.3

### Patch Changes

- 84fce58e: Optimize the behavior of inline sync plugin.

## 7.2.2

### Patch Changes

- 01174470: Bug fixes and small improvements.

  Add gapcursor css in prose package. (3d0832e)
  Add option for `getContent` in slash provider. (6c47b3d)
  Add a command to lift first lit item. (#1003)

## 7.2.1

### Patch Changes

- df03a2cb: Bug fix

  Fix commands not working for multiple editors. #977
  Fix inline math conflicts with inline sync plugin. #983

## 7.2.0

### Minor Changes

- f5e00085: Add inspector and telemetry.

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.
- c69f3076: Rename inspection to telemetry
- 10139088: Fix incorrect system plugin store ref.
- 828cceb9: Add support for editor inspector #960

## 7.1.2-next.3

### Patch Changes

- 10139088: Fix incorrect system plugin store ref.

## 7.1.2-next.2

### Patch Changes

- c69f3076: Rename inspection to telemetry

## 7.1.2-next.1

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.

## 7.1.2-next.0

### Patch Changes

- 828cceb9: Add support for editor inspector #960
- Updated dependencies [828cceb9]
  - @milkdown/core@7.1.2-next.0
  - @milkdown/ctx@7.1.2-next.0
  - @milkdown/prose@7.1.2-next.0

## 7.1.1

### Patch Changes

- f4aaf467: Use slugify to create id for heading nodes
  Fix inline sync plugin causes unneeded changes #924
  Upgrade typescript version to 5 #943
  Add hard break leafText #944

## 7.1.0

### Minor Changes

- 4a60eae7: Add support for HTML nodes.
  Export css files from prosemirror packages.

## 7.0.1

### Patch Changes

- 52dcbbe8: Bug fix.

## 7.0.0

### Major Changes

- 069d719b: Milkdown v7.

  - The editor becomes a first-class headless component.
  - Factory plugins are deprecated and replaced by composable plugins.
  - Runtime plugin toggle.
  - Universal widget plugins.
  - Better Vue and React support.
  - API documentation.

### Patch Changes

- 46010daf: Fix bugs of async composables.
- 2ad4b566: Fix some bugs for rc version.
- ff8a568b: Fix issues in nord-theme and block-plugin.
- 76bed778: Align the API of block plugin with slash and tooltip.
- fc2f4f94: Bug fix version
- cbe8b734: Upgrade prosemirror version and rename collab plugin

## 7.0.0-next.6

### Patch Changes

- cbe8b734: Upgrade prosemirror version and rename collab plugin

## 7.0.0-next.5

### Patch Changes

- 76bed778: Align the API of block plugin with slash and tooltip.

## 7.0.0-next.4

### Patch Changes

- 46010daf: Fix bugs of async composables.

## 7.0.0-next.3

### Patch Changes

- ff8a568b: Fix issues in nord-theme and block-plugin.

## 7.0.0-next.2

### Patch Changes

- fc2f4f94: Bug fix version

## 7.0.0-next.1

### Patch Changes

- 2ad4b566: Fix some bugs for rc version.

## 7.0.0-next.0

### Major Changes

- 069d719b: Pre-release for milkdown v7.

### Patch Changes

- Updated dependencies [069d719b]
  - @milkdown/core@7.0.0-next.0
  - @milkdown/ctx@7.0.0-next.0
  - @milkdown/prose@7.0.0-next.0

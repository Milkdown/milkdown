# @milkdown/plugin-block

## 7.5.4

### Patch Changes

- 705c263: Fix plugin block bugs

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

### Patch Changes

- Updated dependencies [be28e7b]
  - @milkdown/exception@7.5.0
  - @milkdown/utils@7.5.0

## 7.4.1

### Patch Changes

- 9444253: Fatal error, hide when drag will prevent the drag behavior.

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

### Patch Changes

- Updated dependencies [849669b]
  - @milkdown/exception@7.4.0
  - @milkdown/utils@7.4.0

## 7.3.6

### Patch Changes

- 151b789: Bug fix
- Updated dependencies [151b789]
  - @milkdown/exception@7.3.6
  - @milkdown/utils@7.3.6

## 7.3.5

### Patch Changes

- c2a5bcb: Resolve the tippy warning
- Updated dependencies [c2a5bcb]
  - @milkdown/exception@7.3.5
  - @milkdown/utils@7.3.5

## 7.3.4

### Patch Changes

- 2bca917: Fix some bugs and prepare for crepe editor.
- Updated dependencies [2bca917]
  - @milkdown/exception@7.3.4
  - @milkdown/utils@7.3.4

## 7.3.3

### Patch Changes

- 2770d92: Add inline image component and link tooltip component
- Updated dependencies [2770d92]
  - @milkdown/exception@7.3.3
  - @milkdown/utils@7.3.3

## 7.3.2

### Patch Changes

- 5c4a7571: Fix package issues
- Updated dependencies [5c4a7571]
  - @milkdown/exception@7.3.2
  - @milkdown/utils@7.3.2

## 7.3.1

### Patch Changes

- f199e63f: Add code block and list item block in components
- Updated dependencies [f199e63f]
  - @milkdown/exception@7.3.1
  - @milkdown/utils@7.3.1

## 7.3.0

### Minor Changes

- 971ff4c0: Improvement features and bug fix.

  Add support for remark plugin config. (#1085)

  Add support for escape character in inline sync plugin. (#1094)

  Fix missing type error in theme nord. (#1095)

### Patch Changes

- Updated dependencies [971ff4c0]
  - @milkdown/exception@7.3.0
  - @milkdown/utils@7.3.0

## 7.2.4

### Patch Changes

- 37b2f22a: Bug fix.

  Expose trigger key for slash plugin. (#1018)

  Fix heading commands for h4-h6. (#1033)

  Rollback to toggle mark command. (#1035)

  Fix the issue that commands not work for multi editor instances. (#1038)

  Fix the issue that marks won't be extends when pasting pure text from HTML. (#1040)

  Bump prosemirror versions. (#1041)

- Updated dependencies [37b2f22a]
  - @milkdown/exception@7.2.4
  - @milkdown/utils@7.2.4

## 7.2.3

### Patch Changes

- 84fce58e: Optimize the behavior of inline sync plugin.
- Updated dependencies [84fce58e]
  - @milkdown/exception@7.2.3
  - @milkdown/utils@7.2.3

## 7.2.2

### Patch Changes

- 01174470: Bug fixes and small improvements.

  Add gapcursor css in prose package. (3d0832e)
  Add option for `getContent` in slash provider. (6c47b3d)
  Add a command to lift first lit item. (#1003)

- Updated dependencies [01174470]
  - @milkdown/exception@7.2.2
  - @milkdown/utils@7.2.2

## 7.2.1

### Patch Changes

- df03a2cb: Bug fix

  Fix commands not working for multiple editors. #977
  Fix inline math conflicts with inline sync plugin. #983

- Updated dependencies [df03a2cb]
  - @milkdown/exception@7.2.1
  - @milkdown/utils@7.2.1

## 7.2.0

### Minor Changes

- f5e00085: Add inspector and telemetry.

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.
- c69f3076: Rename inspection to telemetry
- 10139088: Fix incorrect system plugin store ref.
- 828cceb9: Add support for editor inspector #960
- Updated dependencies [f5e00085]
- Updated dependencies [45cd3c76]
- Updated dependencies [c69f3076]
- Updated dependencies [10139088]
- Updated dependencies [828cceb9]
  - @milkdown/exception@7.2.0
  - @milkdown/utils@7.2.0

## 7.1.2-next.3

### Patch Changes

- 10139088: Fix incorrect system plugin store ref.
- Updated dependencies [10139088]
  - @milkdown/exception@7.1.2-next.3
  - @milkdown/utils@7.1.2-next.3

## 7.1.2-next.2

### Patch Changes

- c69f3076: Rename inspection to telemetry
- Updated dependencies [c69f3076]
  - @milkdown/exception@7.1.2-next.2
  - @milkdown/utils@7.1.2-next.2

## 7.1.2-next.1

### Patch Changes

- 45cd3c76: Fix circular deps in commands plugin.
- Updated dependencies [45cd3c76]
  - @milkdown/exception@7.1.2-next.1
  - @milkdown/utils@7.1.2-next.1

## 7.1.2-next.0

### Patch Changes

- 828cceb9: Add support for editor inspector #960
- Updated dependencies [828cceb9]
  - @milkdown/core@7.1.2-next.0
  - @milkdown/ctx@7.1.2-next.0
  - @milkdown/exception@7.1.2-next.0
  - @milkdown/prose@7.1.2-next.0
  - @milkdown/utils@7.1.2-next.0

## 7.1.1

### Patch Changes

- f4aaf467: Use slugify to create id for heading nodes
  Fix inline sync plugin causes unneeded changes #924
  Upgrade typescript version to 5 #943
  Add hard break leafText #944
- Updated dependencies [f4aaf467]
  - @milkdown/exception@7.1.1
  - @milkdown/utils@7.1.1

## 7.1.0

### Minor Changes

- 4a60eae7: Add support for HTML nodes.
  Export css files from prosemirror packages.

### Patch Changes

- Updated dependencies [4a60eae7]
  - @milkdown/exception@7.1.0
  - @milkdown/utils@7.1.0

## 7.0.1

### Patch Changes

- 52dcbbe8: Bug fix.
- Updated dependencies [52dcbbe8]
  - @milkdown/exception@7.0.1
  - @milkdown/utils@7.0.1

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
- Updated dependencies [46010daf]
- Updated dependencies [2ad4b566]
- Updated dependencies [ff8a568b]
- Updated dependencies [76bed778]
- Updated dependencies [fc2f4f94]
- Updated dependencies [cbe8b734]
- Updated dependencies [069d719b]
  - @milkdown/exception@7.0.0
  - @milkdown/utils@7.0.0

## 7.0.0-next.6

### Patch Changes

- cbe8b734: Upgrade prosemirror version and rename collab plugin
- Updated dependencies [cbe8b734]
  - @milkdown/exception@7.0.0-next.6
  - @milkdown/utils@7.0.0-next.6

## 7.0.0-next.5

### Patch Changes

- 76bed778: Align the API of block plugin with slash and tooltip.
- Updated dependencies [76bed778]
  - @milkdown/exception@7.0.0-next.5
  - @milkdown/utils@7.0.0-next.5

## 7.0.0-next.4

### Patch Changes

- 46010daf: Fix bugs of async composables.
- Updated dependencies [46010daf]
  - @milkdown/exception@7.0.0-next.4
  - @milkdown/utils@7.0.0-next.4

## 7.0.0-next.3

### Patch Changes

- ff8a568b: Fix issues in nord-theme and block-plugin.
- Updated dependencies [ff8a568b]
  - @milkdown/exception@7.0.0-next.3
  - @milkdown/utils@7.0.0-next.3

## 7.0.0-next.2

### Patch Changes

- fc2f4f94: Bug fix version
- Updated dependencies [fc2f4f94]
  - @milkdown/exception@7.0.0-next.2
  - @milkdown/utils@7.0.0-next.2

## 7.0.0-next.1

### Patch Changes

- 2ad4b566: Fix some bugs for rc version.
- Updated dependencies [2ad4b566]
  - @milkdown/exception@7.0.0-next.1
  - @milkdown/utils@7.0.0-next.1

## 7.0.0-next.0

### Major Changes

- 069d719b: Pre-release for milkdown v7.

### Patch Changes

- Updated dependencies [069d719b]
  - @milkdown/core@7.0.0-next.0
  - @milkdown/ctx@7.0.0-next.0
  - @milkdown/exception@7.0.0-next.0
  - @milkdown/prose@7.0.0-next.0
  - @milkdown/utils@7.0.0-next.0

## 6.5.4

### Patch Changes

- b4003d9: Fix bugs and make some small improvements.
- Updated dependencies [b4003d9]
  - @milkdown/exception@6.5.4
  - @milkdown/utils@6.5.4

## 6.5.3

### Patch Changes

- d5c337d: Ux improvements and bug fix.
- Updated dependencies [d5c337d]
  - @milkdown/exception@6.5.3
  - @milkdown/utils@6.5.3

## 6.5.2

### Patch Changes

- 3cb8683: Fix floating widget positions by @iHaPBoy
- Updated dependencies [3cb8683]
  - @milkdown/exception@6.5.2
  - @milkdown/utils@6.5.2

## 6.5.0

### Minor Changes

- 77ae1d3: Removable plugins, editor status, table inputrule and `injectSlices` factory options.

### Patch Changes

- Updated dependencies [77ae1d3]
  - @milkdown/exception@6.5.0
  - @milkdown/utils@6.5.0

## 6.4.1

### Patch Changes

- c1fd2fe2: Bug fix for android list and prism SSR.
- Updated dependencies [c1fd2fe2]
  - @milkdown/exception@6.4.1
  - @milkdown/utils@6.4.1

## 6.4.0

### Minor Changes

- cd6a6139: Inline sync plugin, vscode paste support, and new internal ctx.

### Patch Changes

- Updated dependencies [cd6a6139]
  - @milkdown/exception@6.4.0
  - @milkdown/utils@6.4.0

## 6.3.2

### Patch Changes

- 161d7104: Fix bug of plugin-menu, react strict mode and muptiple editors.
- Updated dependencies [161d7104]
  - @milkdown/exception@6.3.2
  - @milkdown/utils@6.3.2

## 6.3.1

### Patch Changes

- 8478db7a: Fix bug for memory leak, hardbreak and em to px.
- Updated dependencies [8478db7a]
  - @milkdown/exception@6.3.1
  - @milkdown/utils@6.3.1

## 6.3.0

### Minor Changes

- d3b2bd9d: https://github.com/Saul-Mirone/milkdown/milestone/4

### Patch Changes

- Updated dependencies [d3b2bd9d]
  - @milkdown/exception@6.3.0
  - @milkdown/utils@6.3.0

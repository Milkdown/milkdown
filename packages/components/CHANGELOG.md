# @milkdown/components

## 7.5.5

### Patch Changes

- 56af3f5: Optimize table drag behavior

## 7.5.4

### Patch Changes

- 705c263: Fix plugin block bugs

## 7.5.3

### Patch Changes

- 9cb69ae: Fix the link component will make the editor autofocus when loaded

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

---
"@milkdown/e2e": minor
"@milkdown/components": minor
"@milkdown/core": minor
"@milkdown/crepe": minor
"@milkdown/ctx": minor
"@milkdown/exception": minor
"@milkdown/react": minor
"@milkdown/vue": minor
"@milkdown/plugin-automd": minor
"@milkdown/plugin-block": minor
"@milkdown/plugin-clipboard": minor
"@milkdown/plugin-collab": minor
"@milkdown/plugin-cursor": minor
"@milkdown/plugin-diagram": minor
"@milkdown/plugin-emoji": minor
"@milkdown/plugin-history": minor
"@milkdown/plugin-indent": minor
"@milkdown/plugin-listener": minor
"@milkdown/plugin-math": minor
"@milkdown/plugin-prism": minor
"@milkdown/plugin-slash": minor
"@milkdown/plugin-tooltip": minor
"@milkdown/plugin-trailing": minor
"@milkdown/plugin-upload": minor
"@milkdown/preset-commonmark": minor
"@milkdown/preset-gfm": minor
"@milkdown/theme-nord": minor
"@milkdown/prose": minor
"@milkdown/transformer": minor
"@milkdown/utils": minor
---

## Headless components and Crepe polish

### Feature

#### Migrate from tippy to floating ui

* feat: replace tippy with floating ui in plugin block in https://github.com/Milkdown/milkdown/pull/1356
* feat: migrate tippy to floating ui in plugin slash in https://github.com/Milkdown/milkdown/pull/1375
* feat: add offset for floating ui in https://github.com/Milkdown/milkdown/pull/1384
* feat: migrate to floating ui in plugin tooltip in https://github.com/Milkdown/milkdown/pull/1373

#### Components Improvements

* feat: optimize code block behavior in https://github.com/Milkdown/milkdown/pull/1388
* fix: image caption bug in https://github.com/Milkdown/milkdown/pull/1382
* fix: list item block should respect readonly mode in https://github.com/Milkdown/milkdown/pull/1339
* feat: remove styles in components in https://github.com/Milkdown/milkdown/pull/1346
* feat: optimize block handle in https://github.com/Milkdown/milkdown/pull/1355
* fix: slash menu scroll behavior in https://github.com/Milkdown/milkdown/pull/1386

#### Crepe Improvements

* feat: add better readonly support for crepe in https://github.com/Milkdown/milkdown/pull/1322
* feat: add components in storybook in https://github.com/Milkdown/milkdown/pull/1323
* fix: crepe destroy throw an error in https://github.com/Milkdown/milkdown/pull/1305
* fix: improve styles for crepe in https://github.com/Milkdown/milkdown/pull/1306
* feat: optimize ui for crepe theme in https://github.com/Milkdown/milkdown/pull/1383
* feat: polish crepe image component ui in https://github.com/Milkdown/milkdown/pull/1385
* feat: better drop cursor for crepe in https://github.com/Milkdown/milkdown/pull/1378
* feat: migrate crepe theme to pure css in https://github.com/Milkdown/milkdown/pull/1358

#### Misc

* docs: update default config reference by @emmanuel-ferdman in https://github.com/Milkdown/milkdown/pull/1320
* chore: remove copyright in https://github.com/Milkdown/milkdown/pull/1321
* test: add list item block in stories in https://github.com/Milkdown/milkdown/pull/1338
* chore: add inline image block in storybook in https://github.com/Milkdown/milkdown/pull/1340
* chore: add link tooltip in storybook in https://github.com/Milkdown/milkdown/pull/1341
* chore: add listener plugin in storybook in https://github.com/Milkdown/milkdown/pull/1342
* fix: image block style offset in storybook in https://github.com/Milkdown/milkdown/pull/1345
* chore: 🤖 adjust script names in https://github.com/Milkdown/milkdown/pull/1348
* chore: adjust e2e folder in https://github.com/Milkdown/milkdown/pull/1354
* chore: adjust folders in https://github.com/Milkdown/milkdown/pull/1357
* chore: improve styles in story book in https://github.com/Milkdown/milkdown/pull/1359
* fix: ordered list paste becomes unordered list in https://github.com/Milkdown/milkdown/pull/1368
* feat: optimize storybook in https://github.com/Milkdown/milkdown/pull/1369
* ci: use core pack in https://github.com/Milkdown/milkdown/pull/1387

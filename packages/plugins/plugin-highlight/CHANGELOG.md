# @milkdown/plugin-highlight

## 7.21.0

### Minor Changes

- 9fc90c6: Milkdown minor version release.

  The integration of AI features into the Milkdown editor.

  ## Feat

  - feat(crepe): add OpenAI and Anthropic AI providers (#2355)
  - feat: ship UI surfaces for the AI feature (#2350)
  - feat: expose onError callback for AI feature (#2338)
  - feat: replace-selection mode for streaming plugin (#2335)
  - feat: merge Diff+Streaming into CrepeFeature.AI with provider integration (#2330)
  - feat: per-block diff for the range option (#2329)
  - feat: per-block diff via LCS matching (#2328)
  - feat: add insert-at-cursor mode for streaming plugin (#2318)
  - feat: add support for diff rendering, apply and reject (#2312)

  ## Fix

  - fix(crepe): preserve marks in AI selection for single-paragraph ranges (#2359)
  - fix(inline-latex): should not show edit tooltip for readonly mode (#2348)
  - fix(components): allow foreignObject in code block preview for Mermaid v11+ flowcharts (#2332)
  - fix: improve diff rendering for cross-boundary changes, empty widgets, and block deletions (#2324)

  ## Docs

  - docs(crepe): document built-in OpenAI / Anthropic providers (#2357)
  - docs(crepe): document AI feature UI surfaces and config (#2354)
  - docs: ✏️ fix crepe mismatch

  ## Refactor

  - refactor: remove broken config options from diff and streaming plugins (#2333)

  ## Perf

  - perf: lazy initialize CodeMirror for off-screen code blocks (#2313)

### Patch Changes

- Updated dependencies [9fc90c6]
  - @milkdown/core@7.21.0
  - @milkdown/ctx@7.21.0
  - @milkdown/utils@7.21.0

## 7.20.0

### Minor Changes

- e137982: Milkdown minor version release.

  ## Feat

  - feat: add support for top bar (#2300)
  - feat(crepe): integrate upload plugin in crepe (#2301)
  - feat(image-block): add maxWidth and maxHeight config options (#2291)

  ## Fix

  - fix(preset-commonmark): ordered list label ignores start attribute (#2302)
  - fix(prose): fix Enter key in lists on Chrome Android (#2293)
  - fix(preset-commonmark): preserve ordered list custom start number (#2292)

  ## Refactor

  - refactor: fix some useless checks (#2298)
  - refactor: use a meaningful function to explain why we need h and fragment (#2297)

  ## Ci

  - ci: remove eslint (#2290)

### Patch Changes

- Updated dependencies [e137982]
  - @milkdown/core@7.20.0
  - @milkdown/ctx@7.20.0
  - @milkdown/utils@7.20.0

## 7.19.2

### Patch Changes

- 39f9064: Milkdown patch version release.

  ## Fix

  - fix(plugin-clipboard, preset-gfm): fix pasting multiple tables from Google Docs (#2286)

- Updated dependencies [39f9064]
  - @milkdown/core@7.19.2
  - @milkdown/ctx@7.19.2
  - @milkdown/utils@7.19.2

## 7.19.1

### Patch Changes

- b22143f: Milkdown patch version release.

  ## Fix

  - fix(preset-gfm): incorrect table parsing when pasting from Google Docs (#2283)
  - fix(transformer): inline code with bold/italic marks produces wrong markdown (#2281)
  - fix(preset-gfm): add empty content guard to table_header_row serializer (#2279)
  - fix(plugin-listener): listener bug regards to debounce in react (#2268)

  ## Chore

  - chore: bump up sugar-high version to v1 (#2280)
  - chore: bump up dompurify version to v3.3.2 [SECURITY] (#2267)

- Updated dependencies [b22143f]
  - @milkdown/core@7.19.1
  - @milkdown/ctx@7.19.1
  - @milkdown/utils@7.19.1

## 7.19.0

### Minor Changes

- cf36326: Milkdown minor version release.

  ## Feat

  - feat: 🎸 add optional onImageLoadError callback for image-block (#2251)

  ## Fix

  - fix: exports of crepe package point at incorrect path (#2252)

### Patch Changes

- Updated dependencies [cf36326]
  - @milkdown/core@7.19.0
  - @milkdown/ctx@7.19.0
  - @milkdown/utils@7.19.0

## 7.18.0

### Minor Changes

- 3abf96e: Milkdown minor release.

  ## Feat

  - feat: implement robust email autolinking with new regexps and comprehensive E2E tests (#2217)
  - feat: tooltip auto update (#2204)

  ## Fix

  - fix: handle dom tables properly when copy pasting (#2206)
  - fix(plugin-block): add dragend event listener to block handle element (#2199)
  - fix: simplify icon rendering by removing unnecessary ref and using innerHTML directly (#2200)
  - fix: storybook vite config (#2198)

### Patch Changes

- Updated dependencies [3abf96e]
  - @milkdown/core@7.18.0
  - @milkdown/ctx@7.18.0
  - @milkdown/utils@7.18.0

## 7.17.3

### Patch Changes

- 1b7dcbc: Milkdown patch version release.

  ## Feat

  - feat: add extra params & config for uploader (#2184)

  ## Fix

  - fix: previewLabel was always hidden (#2192)
  - fix: use divs instead of nested buttons (#2189)
  - fix: listener triggered when stored marks set (#2181)

- Updated dependencies [1b7dcbc]
  - @milkdown/core@7.17.3
  - @milkdown/ctx@7.17.3
  - @milkdown/utils@7.17.3

## 7.17.2

### Patch Changes

- 998d472: Milkdown patch version release.

  ## Feat

  - feat: upgrade prosemirror packages versions (#2177)

  ## Fix

  - fix: 🐛 Submit button on the inline edit confirm button (#2163)

- Updated dependencies [998d472]
  - @milkdown/core@7.17.2
  - @milkdown/ctx@7.17.2
  - @milkdown/utils@7.17.2

## 7.17.1

### Patch Changes

- bf8b561: Milkdown patch version release

  ## Ci

  - ci: 🎡 release with OIDC

  This version does not contain any user-facing changes.
  We've migrated our release workflow to use OpenID Connect (OIDC) for authentication. This change enhances security by eliminating the need for long-lived personal access tokens, thereby reducing the risk of token leakage. The new setup allows GitHub Actions to securely authenticate with our package registry using short-lived tokens, ensuring a more robust and secure release process.

- Updated dependencies [bf8b561]
  - @milkdown/core@7.17.1
  - @milkdown/ctx@7.17.1
  - @milkdown/utils@7.17.1

## 7.17.0

### Minor Changes

- 4ced9da: Milkdown minor release.

  ## Feat

  - feat: 🎸 add paste rule (#2126)
  - feat: support to render async preview in code block (#2117)

### Patch Changes

- Updated dependencies [4ced9da]
  - @milkdown/core@7.17.0
  - @milkdown/ctx@7.17.0
  - @milkdown/utils@7.17.0

## 7.16.0

### Minor Changes

- 1d330d7: Milkdown minor version release.

  ## Feat

  - feat: add drop indicator plugin (#2097)
  - feat: add new highlight plugin (#2067)

  ## Fix

  - fix: 🐛 image proxy time sequence (#2110)
  - fix: 🐛 missing doc tag for highlight plugin

  ## Chore

  - chore: 🤖 enable knip and remove dead code and export (#2099)

  ## Refactor

  - refactor: 💡 use api from prosemirror-tables (#2083)

  ## Test

  - test: 💍 improve unit test of transformer (#2109)

  ## Ci

  - ci: 🎡 add pkg-pr-new (#2082)

### Patch Changes

- Updated dependencies [1d330d7]
  - @milkdown/core@7.16.0
  - @milkdown/ctx@7.16.0
  - @milkdown/utils@7.16.0

# @milkdown/plugin-diff

## 7.22.0

### Minor Changes

- bd890e0: Milkdown minor release.

  ## Feat
  - feat(crepe): expose the AI feature to a custom toolbar (#2438)
  - feat(crepe): derive toolbar shortcuts from keymaps (#2437)
  - feat(crepe): give toolbar items an accessible name (#2435)
  - feat(crepe): add --crepe-base-font-size theme variable (#2432)
  - feat(crepe): allow configuring slash menu root and floating options (#2426)

  ## Fix
  - fix(docs): pin builddocs to 1.x to fix api docs build (#2442)
  - fix(prism): re-highlight non-first code blocks on language change (#2440)
  - fix(preset): anchor mark input rules to the cursor to prevent paste corruption (#2433)
  - fix: preserve schema registration order in extendSchema (#2370) (#2429)
  - fix: track innerView.value for reactive re-render in latex inline tooltip (#2425)
  - fix: give internal input elements a unique id (#2416) (#2424)
  - fix: store list spread attribute as boolean (#2419) (#2423)
  - fix: use TextSelection.between for list item cursor placement (#2422)
  - fix: resolve list item selection against current doc (#2412)

  ## Refactor
  - refactor(crepe): forward block handle options explicitly (#2427)

  ## Perf
  - perf: reduce per-keystroke cost in keepTableAlignPlugin and prismPlugin (#2436)

  ## Build
  - build: upgrade to typescript 7 native compiler (#2418)

  ## Ci
  - ci(e2e): cache Playwright browsers and merge shard reports (#2431)

### Patch Changes

- Updated dependencies [bd890e0]
  - @milkdown/core@7.22.0
  - @milkdown/ctx@7.22.0
  - @milkdown/prose@7.22.0
  - @milkdown/transformer@7.22.0
  - @milkdown/utils@7.22.0

## 7.21.3

### Patch Changes

- 95b07b9: Milkdown fix version release.

  ## Feat
  - feat: add getMarkRange and selection snapshot test DSL to prose toolkit (#2406)

  ## Fix
  - fix: cancel list item RAF on destroy (#2409)
  - fix: sanitize unsafe link hrefs and emoji html to prevent stored XSS (#2410)
  - fix: serialize marks spanning multiple nodes as one continuous span (#2405)
  - fix: renovate config

- Updated dependencies [95b07b9]
  - @milkdown/core@7.21.3
  - @milkdown/ctx@7.21.3
  - @milkdown/prose@7.21.3
  - @milkdown/transformer@7.21.3
  - @milkdown/utils@7.21.3

## 7.21.2

### Patch Changes

- 3a54037: Milkdown patch version release.

  ## Fix
  - fix: import Fragment in image-input to fix paste link error (#2325) (#2386)
  - fix: link tooltip empty-selection insert and outside-click dismiss (#2385)
  - fix: cancel pending listener debounce on editor destroy (#2356) (#2384)
  - fix: avoid importing katex in toolbar when latex feature is disabled (#2383)

- Updated dependencies [3a54037]
  - @milkdown/core@7.21.2
  - @milkdown/ctx@7.21.2
  - @milkdown/prose@7.21.2
  - @milkdown/transformer@7.21.2
  - @milkdown/utils@7.21.2

## 7.21.1

### Patch Changes

- a612984: Milkdown patch version release.

  ## Fix
  - fix(crepe): avoid polynomial ReDoS when normalizing provider baseURL (#2366)
  - fix(components): lazy-init SVG sanitizer to keep preview-panel SSR-safe (#2365)

  ## Chore
  - chore(deps): bump fast-uri to 3.1.2 to patch GHSA-v39h-62p7-jpjc (#2367)
  - chore: Pin dependencies (#2364)
  - chore: config renovate to pin github actions (#2363)

- Updated dependencies [a612984]
  - @milkdown/core@7.21.1
  - @milkdown/ctx@7.21.1
  - @milkdown/prose@7.21.1
  - @milkdown/transformer@7.21.1
  - @milkdown/utils@7.21.1

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
  - @milkdown/prose@7.21.0
  - @milkdown/transformer@7.21.0
  - @milkdown/utils@7.21.0

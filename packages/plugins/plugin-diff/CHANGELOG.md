# @milkdown/plugin-diff

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

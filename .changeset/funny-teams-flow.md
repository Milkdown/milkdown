---
'@milkdown/components': minor
'@milkdown/core': minor
'@milkdown/crepe': minor
'@milkdown/ctx': minor
'@milkdown/exception': minor
'@milkdown/react': minor
'@milkdown/vue': minor
'@milkdown/kit': minor
'@milkdown/plugin-automd': minor
'@milkdown/plugin-block': minor
'@milkdown/plugin-clipboard': minor
'@milkdown/plugin-collab': minor
'@milkdown/plugin-cursor': minor
'@milkdown/plugin-diff': minor
'@milkdown/plugin-emoji': minor
'@milkdown/plugin-highlight': minor
'@milkdown/plugin-history': minor
'@milkdown/plugin-indent': minor
'@milkdown/plugin-listener': minor
'@milkdown/plugin-prism': minor
'@milkdown/plugin-slash': minor
'@milkdown/plugin-streaming': minor
'@milkdown/plugin-tooltip': minor
'@milkdown/plugin-trailing': minor
'@milkdown/plugin-upload': minor
'@milkdown/preset-commonmark': minor
'@milkdown/preset-gfm': minor
'@milkdown/theme-nord': minor
'@milkdown/prose': minor
'@milkdown/transformer': minor
'@milkdown/utils': minor
---

Milkdown minor version release.

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

# PLANNER Private Context

## Key Findings

1. The NK_TMP/milkdown-debounce-bug/ app was scaffolded with `create-vite` (react-ts template) but has NO milkdown dependencies yet -- just the stock Vite+React boilerplate.
2. NK_TMP/ is NOT in pnpm-workspace.yaml. Adding it there is the simplest path to use workspace:* protocol for milkdown packages.
3. All milkdown packages export `./src/index.ts` directly (not built lib) in their non-publishConfig exports. So Vite will resolve to TS source.
4. The e2e tests use a vanilla (non-React) page at `e2e/src/plugin-listener/main.ts`. The page logs to console, and Playwright captures via `page.waitForEvent('console')`.
5. The existing `listener.spec.ts` tests test single keystrokes only. No rapid-typing / debounce test exists.
6. The fix in `index.ts` is the IIFE pattern documented in the bug doc. The selection handling (lines 191-200) must remain inside the `apply` body, NOT inside the debounce.
7. The reproduction app does NOT need full controlled-component complexity to demonstrate the core debounce bug. A simple uncontrolled editor with a markdownUpdated listener that counts/logs calls is sufficient to prove "N callbacks instead of 1". The controlled-component cursor-reset is a downstream consequence, not needed for the core proof.

## Decision: Simplify the NK_TMP reproduction

The task description asks us to consider whether full React controlled-component complexity is needed. The answer is NO. The core bug is observable with a simple uncontrolled editor: just count markdownUpdated callbacks during rapid typing. This is the 80/20 approach.

# Implementation Report: Fix Milkdown plugin-listener Debounce Bug

## Status: COMPLETE (All 4 Phases)

## Summary

Fixed the debounce bug in `@milkdown/plugin-listener` where `markdownUpdated` and `updated` listeners fired once per keystroke instead of being properly debounced. Added an e2e regression test to prevent future regressions.

## Root Cause

In `packages/plugins/plugin-listener/src/index.ts`, the `debounce()` call was inside the ProseMirror plugin's `state.apply()` method (lines 208-231). Each transaction created a brand-new debounced wrapper, so successive calls never canceled each other's timers. The debounce was effectively a no-op.

## Fix Applied (Phase 3)

**File**: `packages/plugins/plugin-listener/src/index.ts`

Per the plan reviewer's feedback, used the **existing closure scope** (no IIFE) to hoist the debounced handler:

1. Added `type Transaction` import from `@milkdown/prose/state` (line 13)
2. Added `latestTr: Transaction | null` variable alongside `prevDoc`/`prevMarkdown`/`prevSelection` (line 163)
3. Created `debouncedHandler` as a `const` in the same closure scope (lines 165-189), before `new Plugin({...})`
4. Replaced the `apply` function body: selection handling remains immediate; for doc/markdown updates, `apply` now sets `latestTr = tr` and calls `debouncedHandler()` instead of creating a new debounce wrapper each time

## E2E Regression Test (Phase 4)

1. Added `?type=debounce` mode to `e2e/src/plugin-listener/main.ts` (8 lines, additive)
2. Added `markdownUpdated is properly debounced during rapid typing` test to `e2e/tests/plugin/listener.spec.ts` (25 lines, additive)

## Files Modified

### Main repo (SURGICAL):
1. **`packages/plugins/plugin-listener/src/index.ts`** -- The fix (import + hoisted debounce)
2. **`e2e/src/plugin-listener/main.ts`** -- Added `?type=debounce` mode
3. **`e2e/tests/plugin/listener.spec.ts`** -- Added debounce regression test

### NK_TMP:
4. **`NK_TMP/milkdown-debounce-bug/tests/debounce-bug.spec.ts`** -- Updated to reflect fixed state

## Decisions

1. **No IIFE**: Per reviewer feedback, placed `latestTr` and `debouncedHandler` directly in the existing closure scope. Simpler, follows same pattern as `prevDoc`/`prevMarkdown`/`prevSelection`.

2. **`latestTr = null` after firing**: Nulls out stale transaction reference after processing.

3. **E2E test threshold**: Used `<= 3` (not `=== 1`) for callback count assertion. Allows timing variance. In practice, count was consistently 1.

## Verification Results

### NK_TMP Playwright tests:
- Bug demonstration test: FAILS as expected (callbackCount=1, not >3) -- **proves the fix works**
- Fix verification test: PASSES (callbackCount=1)

### E2E tests (all 3 pass):
- `on markdown updated` -- existing test, unchanged behavior
- `on selection updated` -- existing test, unchanged behavior
- `markdownUpdated is properly debounced during rapid typing` -- new regression test

### TypeScript:
- Same 19 pre-existing TS errors before and after. No new errors introduced.

## Deviations from Plan

- **CSS build artifacts**: E2e tests required `prosemirror.css` and `tables.css` in `packages/prose/lib/style/`. Copied manually from `node_modules` source packages to unblock testing.
- **CI env variable**: Environment had `CI` set, causing Playwright to use CI mode. Fixed by unsetting `CI` when running e2e tests locally.

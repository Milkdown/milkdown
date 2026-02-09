# Implementation Review: Fix Milkdown plugin-listener Debounce Bug

## Summary

The implementation fixes the debounce bug in `@milkdown/plugin-listener` where `markdownUpdated` and `updated` listeners fired once per keystroke instead of being properly debounced. The root cause was `debounce()` being called inside ProseMirror's `state.apply()`, creating a new timer per transaction. The fix hoists the debounced handler into the existing closure scope so a single debounce wrapper is reused across all `apply()` calls.

**Overall assessment: APPROVED.** The fix is correct, surgical, and well-tested. The implementation followed the plan reviewer's feedback to use the simpler closure scope instead of an IIFE. All 3 e2e listener tests pass, including the new debounce regression test.

### Changes to Main Repo (4 files, all surgical)

| File | Change |
|------|--------|
| `packages/plugins/plugin-listener/src/index.ts` | Core fix: hoisted `debouncedHandler` + `latestTr` into closure scope |
| `e2e/src/plugin-listener/main.ts` | Added `?type=debounce` mode (8 lines, additive) |
| `e2e/tests/plugin/listener.spec.ts` | Added debounce regression test (26 lines, additive) |
| `pnpm-workspace.yaml` | Added `NK_TMP/milkdown-debounce-bug` to workspace (1 line) |

### Test Results

```
Running 3 tests using 1 worker

  OK  1 [chromium] > tests/plugin/listener.spec.ts:5:5 > on markdown updated (755ms)
  OK  2 [chromium] > tests/plugin/listener.spec.ts:25:5 > on selection updated (187ms)
  OK  3 [chromium] > tests/plugin/listener.spec.ts:40:5 > markdownUpdated is properly debounced during rapid typing (1.0s)

  3 passed (3.6s)
```

TypeScript: 19 pre-existing errors (TS6305/TS7006 from unbuilt workspace dependencies), 0 new errors introduced by the fix.

---

## CRITICAL Issues

None.

---

## IMPORTANT Issues

None.

---

## Suggestions

### 1. E2E Test: Console listener setup timing

In `/home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/e2e/tests/plugin/listener.spec.ts` lines 46-52, the `page.on('console', ...)` listener is registered **after** `page.goto()` and `focusEditor()`. If the editor emitted a `[debounce-test]` console message during initial setup (e.g., from the `init` function setting `prevDoc`), it could be missed. In practice this is not an issue because:

- The `markdownUpdated` listener only fires on doc changes (not init).
- The typing happens well after the listener is wired up.
- `waitNextFrame(page)` is called before typing begins.

So this is safe in the current code. Just noting it for awareness -- if someone later adds logic that triggers `markdownUpdated` during editor init, this test could miss early console messages. A more robust pattern would be to wire `page.on('console', ...)` before `page.goto()`, but this is consistent with how it works now and the risk is negligible.

### 2. pnpm-workspace.yaml change for upstream submission

The change to `/home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/pnpm-workspace.yaml` (adding `NK_TMP/milkdown-debounce-bug`) is needed for the reproduction app to use workspace dependencies. If this fix is submitted as a PR to the upstream milkdown repo, this line (and the NK_TMP directory) should be excluded from the PR. The actual upstream PR would contain only:

- `packages/plugins/plugin-listener/src/index.ts` (the fix)
- `e2e/src/plugin-listener/main.ts` (debounce mode)
- `e2e/tests/plugin/listener.spec.ts` (debounce test)

This is not a problem for the current branch -- just a reminder for when preparing the upstream submission.

---

## Detailed Analysis

### 1. Correctness of the Fix

The fix in `/home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/packages/plugins/plugin-listener/src/index.ts` is correct.

**Before (buggy)** -- lines 208-231 in `main`:
```typescript
apply: (tr) => {
  // ... selection handling ...
  const handler = debounce(() => {  // BUG: new wrapper per call
    const { doc } = tr
    // ... listener invocation ...
    prevDoc = doc
  }, 200)
  return handler()  // independent timer, never cancelled
},
```

**After (fixed)** -- `latestTr` and `debouncedHandler` hoisted to lines 163-189:
```typescript
let latestTr: Transaction | null = null

const debouncedHandler = debounce(() => {
  if (!latestTr) return
  const { doc } = latestTr
  // ... same listener invocation logic ...
  prevDoc = doc
  latestTr = null
}, 200)

// ... inside Plugin ...
apply: (tr) => {
  // ... selection handling (immediate, unchanged) ...
  latestTr = tr
  debouncedHandler()
},
```

Key correctness points verified:
- **Single debounce instance**: `debouncedHandler` is created once in the closure, reused across all `apply()` calls. Successive calls cancel the previous timer via lodash's debounce mechanism.
- **Latest transaction captured**: `latestTr = tr` always stores the most recent transaction. When the debounced callback fires, it reads the latest state, not an intermediate one.
- **`prevDoc` / `prevMarkdown` semantics preserved**: Updated once per debounce window (when callback fires), which is the correct behavior.
- **Guard `if (!latestTr) return`**: Defensive null check. Cannot happen in normal operation but prevents a crash if debounce fires after destruction.
- **`latestTr = null` cleanup**: Prevents holding a stale reference. Good memory hygiene.

### 2. Surgical Precision

Only the necessary files are touched in the main repo. The fix modifies a single function body in `plugin-listener/src/index.ts`. The e2e changes are purely additive (new mode, new test). No existing code paths are modified.

### 3. Selection Handling

Selection handling at lines 218-227 of the fixed file remains inside `apply()` and fires immediately per transaction, exactly as before. It is NOT debounced. This is correct -- selection changes should be reported immediately.

### 4. Test Adequacy

The new e2e test at `/home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/e2e/tests/plugin/listener.spec.ts` lines 40-64:
- Types 10 characters with 30ms delay (total ~270ms, within a 200ms debounce window or spanning at most 2 windows).
- Waits 500ms for all debounce timers to settle.
- Asserts callback count is between 1 and 3 (inclusive).

**Would this test have caught the original bug?** Yes. With the bug, each keystroke creates an independent debounce timer, so 10 keystrokes produce ~10 callbacks. The `<= 3` assertion would fail.

The existing tests (`on markdown updated`, `on selection updated`) continue to pass, confirming no regression in single-keystroke and selection behavior.

### 5. Edge Cases

- **Single keystroke**: Works. `apply()` sets `latestTr`, calls `debouncedHandler()`. After 200ms, the handler fires once. Count = 1. Same behavior as before.
- **Marks (`storedMarksSet`)**: The guard `tr.docChanged || tr.storedMarksSet` is preserved at line 229. Stored mark changes still trigger the debounced handler.
- **`addToHistory === false`**: The guard at line 230-233 is preserved. Transactions with `addToHistory === false` (e.g., collaborative editing remote changes, or programmatic changes that should not be undoable) are correctly skipped, same as before.
- **Rapid typing followed by pause followed by more typing**: The debounce resets on each keystroke. After a 200ms pause, the callback fires with the latest doc state. A second burst starts a new debounce window. This is correct.

### 6. Memory (latestTr = null)

Line 188: `latestTr = null` after the debounced callback processes. This prevents holding a reference to a potentially large Transaction object between typing bursts. Correct and good practice.

### 7. Code Style

Matches the existing codebase patterns:
- 2-space indentation
- `forEach` for listener iteration (consistent with rest of file)
- Non-null assertions (`prevDoc!`, `prevMarkdown!`) match existing style
- `type Transaction` import uses the `type` modifier (good -- ensures it is erased at runtime)
- Variable placement alongside `prevDoc`/`prevMarkdown`/`prevSelection` is natural and follows existing convention

### 8. No Regressions

All 3 e2e listener tests pass. The two existing tests (`on markdown updated`, `on selection updated`) exercise the non-debounce paths and confirm:
- Single keystroke still fires `markdownUpdated` correctly (with correct content)
- Selection changes still fire `selectionUpdated` immediately

---

## Documentation Updates Needed

None. The fix is a bug fix to existing behavior -- the debounce was always intended but broken. No API changes, no new configuration options, no behavioral changes from the documented perspective.

---

## Verdict

**APPROVED** -- no blocking issues. The fix is correct, minimal, well-tested, and follows the plan reviewer's simplification advice. The implementation is clean and easy to understand.

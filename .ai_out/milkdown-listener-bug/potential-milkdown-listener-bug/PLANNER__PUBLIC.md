# Implementation Plan: Fix Milkdown plugin-listener Debounce Bug

## 1. Problem Understanding

**Goal**: Fix the `@milkdown/plugin-listener` debounce bug where `markdownUpdated` (and `updated`) listeners fire once per keystroke instead of once per debounce window during rapid typing.

**Root cause**: In `/packages/plugins/plugin-listener/src/index.ts` lines 208-231, `debounce()` is called **inside** the ProseMirror plugin's `state.apply()` method. Each transaction creates a brand-new debounce wrapper, so successive calls never cancel each other's timers. The debounce is effectively a no-op.

**Constraints**:
- Changes to the main milkdown repo must be SURGICAL and MINIMAL
- NK_TMP/ directory has free reign
- Must use LOCAL milkdown source files (not npm)
- Playwright is REQUIRED for the reproduction tests

**Assumptions**:
- The reproduction app does NOT need full React controlled-component complexity. An uncontrolled editor with a counting listener suffices to prove "N callbacks instead of 1 debounced callback."
- Selection handling must remain non-debounced (fire immediately per transaction).
- The `updated` listener has the same debounce bug as `markdownUpdated` since both are inside the same debounced block.

---

## 2. High-Level Architecture

```
Phase 1: NK_TMP reproduction app (local milkdown source, simple editor + counter)
    |
Phase 2: Playwright test in NK_TMP (proves bug: rapid typing -> N callbacks)
    |
Phase 3: Fix in packages/plugins/plugin-listener/src/index.ts (hoist debounce)
    |
Phase 4: E2E test in e2e/tests/plugin/listener.spec.ts (debounce regression test)
```

Each phase builds on the previous. Phases 1-2 are in NK_TMP (free reign). Phases 3-4 touch the main repo (surgical).

---

## 3. Phase 1: Reproduction App Setup

**Goal**: Make `NK_TMP/milkdown-debounce-bug/` use LOCAL milkdown source and display a simple editor that counts `markdownUpdated` callbacks.

**Components affected**:
- `NK_TMP/milkdown-debounce-bug/package.json`
- `NK_TMP/milkdown-debounce-bug/vite.config.ts`
- `NK_TMP/milkdown-debounce-bug/src/App.tsx`
- `pnpm-workspace.yaml` (monorepo root)

### Key Decision: How to Reference Local Packages

**Chosen approach**: Add `NK_TMP/milkdown-debounce-bug` to `pnpm-workspace.yaml` and use `workspace:*` protocol.

**Why**: This is how the existing `e2e/` package already works. It is the idiomatic pnpm monorepo pattern, requires no Vite alias hacks, and the milkdown packages already export `./src/index.ts` directly so Vite will resolve to TypeScript source automatically.

**Alternative considered**: Vite `resolve.alias` entries pointing to `../../packages/plugins/plugin-listener/src/index.ts` etc. Rejected because it requires enumerating every package path and is fragile. The `workspace:*` approach resolves all transitive deps naturally.

### Steps

1. **Add NK_TMP/milkdown-debounce-bug to pnpm-workspace.yaml**
   - Add `'NK_TMP/milkdown-debounce-bug'` to the `packages:` list.
   - This is the ONLY change to a root monorepo config file.

2. **Add milkdown dependencies to NK_TMP/milkdown-debounce-bug/package.json**
   - Add to `dependencies`:
     ```
     "@milkdown/core": "workspace:*",
     "@milkdown/preset-commonmark": "workspace:*",
     "@milkdown/plugin-listener": "workspace:*",
     "@milkdown/react": "workspace:*",
     "@milkdown/theme-nord": "workspace:*",
     "@milkdown/ctx": "workspace:*",
     "@milkdown/prose": "workspace:*",
     "@prosemirror-adapter/react": "^0.5.1"
     ```
   - Note: `@milkdown/react` and `@prosemirror-adapter/react` are needed because this is a React app. However we will use a SIMPLE setup (see step 4).

3. **Run `pnpm install` from monorepo root**
   - This links the workspace packages. Redirect output to `.tmp/pnpm-install.log`.

4. **Replace `src/App.tsx` with a simple reproduction component**

   **Design decision**: Use the simplest possible setup that proves the bug -- an uncontrolled editor with a `markdownUpdated` listener that increments a visible counter and logs to console. No controlled-component pattern needed. The core bug is "N debounce callbacks instead of 1."

   The component should:
   - Create a Milkdown editor with `@milkdown/react` (MilkdownProvider, Milkdown, useEditor)
   - Register a `markdownUpdated` listener via `listenerCtx`
   - On each callback: increment a counter displayed in the DOM (e.g., `<span id="callback-count">{count}</span>`) AND log to console with a tag like `[markdownUpdated]`
   - Also display a `<span id="callback-log">` that shows a JSON array of timestamps or a simple comma-separated list of call indices, so Playwright can read the count in a single DOM query
   - Show instructions: "Type rapidly in the editor. The callback count should be ~1 per typing pause but with the bug it will be ~N (one per keystroke)."

5. **Verify the app builds and runs**
   - `cd NK_TMP/milkdown-debounce-bug && pnpm dev` -- confirm the editor renders and the counter increments.

### Verification
- Editor renders with nord theme
- Typing a single character shows callback count = 1
- Typing 10 chars rapidly shows callback count ~ 10 (demonstrating the bug)

---

## 4. Phase 2: Playwright Tests for Reproduction

**Goal**: Add Playwright to `NK_TMP/milkdown-debounce-bug/` with a test that quantitatively proves the debounce bug.

**Components affected**:
- `NK_TMP/milkdown-debounce-bug/package.json` (devDependencies)
- `NK_TMP/milkdown-debounce-bug/playwright.config.ts` (new)
- `NK_TMP/milkdown-debounce-bug/tests/debounce-bug.spec.ts` (new)

### Steps

1. **Add Playwright devDependency**
   - Add `"@playwright/test": "^1.54.1"` to devDependencies in package.json.
   - Run `pnpm install` then `pnpm exec playwright install chromium`. Redirect output to `.tmp/`.

2. **Create `playwright.config.ts`**
   - Minimal config:
     - `testDir: './tests'`
     - `baseURL: 'http://localhost:5173'` (Vite default)
     - `webServer.command: 'pnpm dev'`
     - `webServer.url: 'http://localhost:5173'`
     - `webServer.reuseExistingServer: true`
     - Single chromium project

3. **Create `tests/debounce-bug.spec.ts`**

   The test strategy uses **two approaches** to count callbacks, for robustness:
   - **DOM-based**: Read `#callback-count` text content after typing
   - **Console-based**: Collect console messages containing `[markdownUpdated]`

   **Test case**: "rapid typing produces too many markdownUpdated callbacks (bug demonstration)"
   - Navigate to `http://localhost:5173`
   - Wait for `.milkdown` selector (editor loaded)
   - Set up console listener for `[markdownUpdated]` messages
   - Focus the editor's contenteditable element (`.milkdown .editor` or `[contenteditable="true"]`)
   - Press End to position cursor at end
   - Type 10 characters with `page.keyboard.type('abcdefghij', { delay: 30 })` -- 30ms between keys, all within a single 200ms debounce window (total typing time = 270ms, last key at t=270ms, debounce fires at t=470ms)
   - Wait 500ms after typing completes (for all debounce timers to fire)
   - Read the callback count from `#callback-count`
   - **Bug assertion**: `expect(callbackCount).toBeGreaterThan(3)` -- proves the bug (expect ~10)
   - Add a commented-out fix assertion: `// expect(callbackCount).toBeLessThanOrEqual(3)` -- to be flipped after Phase 3

   **Second test case** (optional but recommended): "after fix, rapid typing produces at most 3 callbacks"
   - Same setup, but with the assertion `expect(callbackCount).toBeLessThanOrEqual(3)`
   - Mark this test as `test.skip` initially, with a comment: "Enable after Phase 3 fix is applied"

4. **Run tests and confirm the bug test passes**
   - `cd NK_TMP/milkdown-debounce-bug && pnpm exec playwright test`
   - The "bug demonstration" test should PASS (confirming the bug exists)

### Verification
- Playwright test runs successfully
- Bug test passes (callback count > 3, typically ~10)
- Console output shows the actual count for human verification

---

## 5. Phase 3: Fix the Bug in Milkdown Source

**Goal**: Fix `packages/plugins/plugin-listener/src/index.ts` so the debounced handler is created once and reused across `apply()` calls.

**Components affected**:
- `/packages/plugins/plugin-listener/src/index.ts` -- lines 190-232 ONLY

### The Fix

**Pattern**: Wrap the `apply` function value in an IIFE that creates the debounced handler in a closure, then returns the actual `apply` function.

**What changes**:
- Lines 190-232 (the `apply:` property) get restructured
- The `debounce(...)` call moves OUTSIDE of `apply` into the IIFE closure
- A `latestTr` variable is introduced to capture the most recent transaction
- The returned `apply` function updates `latestTr` and calls the single debounced handler
- Selection handling (lines 191-200) stays INSIDE the returned apply function, executing immediately per transaction (NOT debounced)

**What does NOT change**:
- Lines 1-189 (imports, ListenerManager class, plugin factory up to `state: {`)
- Lines 233-246 (rest of plugin, plugin.meta)
- The `init` function (lines 186-189)
- The selection handling logic (just its location changes slightly)
- The debounce delay (200ms)
- The listener invocation logic inside the debounced callback

### Detailed Transform

**Current structure** (buggy):
```
state: {
  init: (_, instance) => { ... },
  apply: (tr) => {
    // selection handling (immediate) - lines 191-200
    // early return guard - lines 202-206
    const handler = debounce(() => {    // BUG: new wrapper each time
      // updated + markdownUpdated logic
    }, 200)
    return handler()
  },
}
```

**Target structure** (fixed):
```
state: {
  init: (_, instance) => { ... },
  apply: (() => {
    let latestTr: Transaction | null = null

    const debouncedHandler = debounce(() => {
      if (!latestTr) return
      const { doc } = latestTr
      // updated + markdownUpdated logic (same as before, but reads from latestTr)
      latestTr = null
    }, 200)

    return (tr: Transaction) => {
      // selection handling (immediate) - same code as before
      // early return guard - same code as before
      latestTr = tr
      debouncedHandler()
    }
  })(),
}
```

### Key Implementation Notes

1. **Import `Transaction` type**: The `tr` parameter's type `Transaction` needs to be imported from `@milkdown/prose/state`. Check if it is already imported -- currently only `Plugin` and `PluginKey` are imported from that module. Add `Transaction` to that import.

2. **`latestTr = null` after firing**: The debounced callback should set `latestTr = null` after processing, to avoid holding a reference to a stale transaction object. This is a minor memory hygiene improvement.

3. **Guard `if (!latestTr) return`**: Defensive check at the start of the debounced callback. Should never happen in practice but prevents a crash if debounce fires after the editor is destroyed.

4. **The `return handler()` on the old line 231**: The old code returns the result of `handler()` (which is `undefined` from lodash debounce). The new code does NOT return anything from the apply function either, which is correct -- ProseMirror's `StateField.apply` return value is used for state field values, but this plugin uses `state` purely for side-effects (no `toJSON`/`fromJSON`), so the return value is unused. The existing code's `return handler()` was accidental, not intentional.

5. **Preserve exact whitespace style**: Match the existing code style (2-space indent, no trailing commas after closing braces in the same pattern as existing).

### Steps

1. Open `/packages/plugins/plugin-listener/src/index.ts`
2. Add `Transaction` to the import from `@milkdown/prose/state` (line 13: `import { Plugin, PluginKey } from '@milkdown/prose/state'` becomes `import { Plugin, PluginKey, type Transaction } from '@milkdown/prose/state'`)
3. Replace lines 190-232 with the IIFE pattern described above
4. Verify no other changes are needed

### Verification
- TypeScript compiles without errors: `cd packages/plugins/plugin-listener && pnpm exec tsc --noEmit` (or the monorepo build command)
- NK_TMP Playwright "bug demonstration" test now FAILS (callback count <= 3 instead of > 3) -- this proves the fix works
- Enable the "after fix" test in NK_TMP and confirm it PASSES
- Run existing e2e tests: `cd e2e && pnpm test` -- all existing tests pass

---

## 6. Phase 4: E2E Test in Milkdown Repo

**Goal**: Add a debounce-specific regression test to the existing e2e test suite so the bug cannot regress.

**Components affected**:
- `/e2e/src/plugin-listener/main.ts` -- add debounce-counting mode
- `/e2e/tests/plugin/listener.spec.ts` -- add debounce test case

### Strategy

The existing e2e listener page (`/plugin-listener/?type=markdown`) logs `console.log(markdown, prevMarkdown)` on each `markdownUpdated` callback. The existing test captures a single console event.

For the debounce test, we need to count HOW MANY callbacks fire during rapid typing. Two approaches:

**Chosen approach**: Add a new `?type=debounce` mode to the e2e page that logs a special tag with each callback, allowing the Playwright test to count console messages.

**Why not reuse `?type=markdown`**: The existing markdown handler logs `console.log(markdown, prevMarkdown)` which works fine for single-event tests but does not provide a clean counting mechanism. Adding a new mode keeps existing tests untouched.

### Steps

#### 4a. Modify `e2e/src/plugin-listener/main.ts`

Add a new branch for `type === 'debounce'`:

```typescript
if (type === 'debounce') {
  let callCount = 0
  listener.markdownUpdated((_ctx, markdown, _prevMarkdown) => {
    callCount++
    // oxlint-disable-next-line no-console
    console.log(`[debounce-test] callCount=${callCount}`)
  })
}
```

This goes after the existing `if (type === 'selection')` block (line 33). It is additive -- does not modify existing code paths.

#### 4b. Add test to `e2e/tests/plugin/listener.spec.ts`

Add a new test case after the existing two tests:

```typescript
test('markdownUpdated is properly debounced during rapid typing', async ({ page }) => {
  await page.goto('/plugin-listener/?type=debounce')
  await focusEditor(page)
  await waitNextFrame(page)

  // Collect all debounce-test console messages
  const debounceLogs: string[] = []
  page.on('console', (msg) => {
    const text = msg.text()
    if (text.includes('[debounce-test]')) {
      debounceLogs.push(text)
    }
  })

  // Type 10 characters rapidly (30ms between keys, well within 200ms debounce)
  await page.keyboard.type('abcdefghij', { delay: 30 })

  // Wait for debounce to fire (200ms after last keystroke + buffer)
  await page.waitForTimeout(500)

  // With proper debouncing, we expect at most 3 callbacks
  // (timing variance may cause 2-3 debounce windows, but never 10)
  expect(debounceLogs.length).toBeLessThanOrEqual(3)
  expect(debounceLogs.length).toBeGreaterThanOrEqual(1)
})
```

**Why `<= 3` and not `=== 1`**: Playwright's keyboard.type with `delay: 30` introduces real timing variance. The 10 keystrokes span ~270ms. With a 200ms debounce window, it is theoretically possible for the debounce to fire partway through if OS scheduling delays a keystroke. Using `<= 3` is a robust threshold that clearly distinguishes "debounced" (1-3) from "not debounced" (8-10).

### Verification
- Run `cd e2e && pnpm test -- tests/plugin/listener.spec.ts` -- all 3 tests pass
- Run the full e2e suite to confirm no regressions

---

## 7. Technical Considerations

### Transaction Reference Lifetime

The `latestTr` variable holds a reference to the most recent ProseMirror Transaction. Transactions are lightweight objects that reference the document state. Setting `latestTr = null` after the debounced callback fires ensures we do not prevent garbage collection of intermediate transaction objects. This is good practice but not critical for correctness.

### Thread Safety / Reentrancy

ProseMirror dispatches transactions synchronously on the main thread. The `apply` function is called synchronously per transaction. The debounce timer fires asynchronously. There is no race condition: `latestTr` is always set synchronously before `debouncedHandler()` is called, and the debounced callback reads it asynchronously after the debounce window. By that time, `latestTr` holds the last transaction from the burst.

### `prevDoc` / `prevMarkdown` Correctness

With the fix, `prevDoc` and `prevMarkdown` are updated only once per debounce window (when the debounced callback fires), not once per transaction. This is the CORRECT behavior -- `prevDoc` should represent the document state at the time of the last emission, not an intermediate state.

### Edge Case: Single Keystroke

A single keystroke still works: `apply` is called once, sets `latestTr`, calls `debouncedHandler()`. After 200ms the handler fires, processes the single transaction. Callback count = 1. This is the same behavior as before the fix (the old code also fired once per single keystroke, just 200ms later).

### `storedMarksSet` Transactions

The guard `tr.docChanged || tr.storedMarksSet` remains unchanged. Stored mark changes are debounced alongside doc changes, same as before.

---

## 8. Testing Strategy Summary

| Test                                         | Location                                      | What it proves                             |
|----------------------------------------------|-----------------------------------------------|--------------------------------------------|
| NK_TMP: bug demonstration                    | NK_TMP/.../tests/debounce-bug.spec.ts         | Bug exists (N callbacks per burst)         |
| NK_TMP: fix verification                     | Same file, second test case                   | Fix works (1-3 callbacks per burst)        |
| E2E: debounce regression                     | e2e/tests/plugin/listener.spec.ts             | Debounce works in repo e2e suite           |
| E2E: existing "on markdown updated"          | Same file (existing)                          | Single-keystroke still works               |
| E2E: existing "on selection updated"         | Same file (existing)                          | Selection listener unaffected              |

---

## 9. Files Modified (Summary)

### Main repo (SURGICAL -- 3 files):
1. **`pnpm-workspace.yaml`** -- Add 1 line: `'NK_TMP/milkdown-debounce-bug'`
2. **`packages/plugins/plugin-listener/src/index.ts`** -- Restructure lines 190-232 (IIFE pattern), add `Transaction` type import
3. **`e2e/src/plugin-listener/main.ts`** -- Add `if (type === 'debounce')` block (~7 lines)
4. **`e2e/tests/plugin/listener.spec.ts`** -- Add 1 new test case (~20 lines)

### NK_TMP (free reign):
1. **`NK_TMP/milkdown-debounce-bug/package.json`** -- Add milkdown + Playwright dependencies
2. **`NK_TMP/milkdown-debounce-bug/vite.config.ts`** -- No changes needed (workspace resolution handles everything)
3. **`NK_TMP/milkdown-debounce-bug/src/App.tsx`** -- Replace with reproduction component
4. **`NK_TMP/milkdown-debounce-bug/playwright.config.ts`** -- New file
5. **`NK_TMP/milkdown-debounce-bug/tests/debounce-bug.spec.ts`** -- New file

---

## 10. Open Questions / Decisions Needed

1. **pnpm-workspace.yaml change**: Adding `NK_TMP/milkdown-debounce-bug` to the workspace is a monorepo config change. It is harmless (NK_TMP is gitignored from npm publish) but the implementor should confirm this is acceptable. If not, the alternative is Vite `resolve.alias` in the reproduction app's vite.config.ts, which is more verbose but avoids touching pnpm-workspace.yaml.

2. **Debounce delay value**: The current delay is 200ms. The fix preserves this value. If there is a desire to make it configurable, that is a separate enhancement -- out of scope for this bug fix.

3. **`updated` listener**: The `updated` listener (doc-level, no serialization) has the same debounce bug. The fix addresses both `updated` and `markdownUpdated` since they share the same debounced callback. No separate action needed.

---

## 11. Execution Order and Dependencies

```
Phase 1 (reproduction app) -- no dependencies, start here
    |
    v
Phase 2 (Playwright tests) -- depends on Phase 1
    |
    v
Phase 3 (fix the bug) -- depends on Phase 2 for verification
    |
    v
Phase 4 (e2e test) -- depends on Phase 3
```

Within each phase, steps are sequential. Between phases, commit at milestones:
- Commit after Phase 1+2 (reproduction app + tests proving the bug)
- Commit after Phase 3 (the fix)
- Commit after Phase 4 (e2e regression test)

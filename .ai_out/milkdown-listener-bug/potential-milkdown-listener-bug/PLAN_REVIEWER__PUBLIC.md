# Plan Review: Fix Milkdown plugin-listener Debounce Bug

## Executive Summary

The plan correctly identifies the root cause (debounce re-created per `apply()` call) and proposes a sound fix. The phased approach (reproduce -> test -> fix -> regress) is well-structured. However, the IIFE pattern for the fix is unnecessarily complex when a simpler alternative exists in the same closure scope. One minor concern about the pnpm-workspace.yaml change needs acknowledgment. Overall this is a well-thought-out plan that needs one simplification and a couple of small adjustments.

## Critical Issues (BLOCKERS)

None.

## Major Concerns

### 1. IIFE Pattern is Unnecessary Complexity

- **Concern**: The plan proposes wrapping `apply` in an IIFE to create a closure for `latestTr` and `debouncedHandler`. This is over-engineering because the variables `prevDoc`, `prevMarkdown`, `prevSelection`, `serializer`, `listeners`, and `ctx` are already in a shared closure scope (the `async ()` function starting at line 150 of `/packages/plugins/plugin-listener/src/index.ts`). The debounced handler can simply be a `const` defined alongside those variables, before the `new Plugin({...})` call.

- **Why**: The IIFE adds cognitive complexity (readers have to mentally parse the immediately-invoked function pattern) for zero benefit. The closure scope that already holds `prevDoc` etc. is the exact right place for the debounced handler.

- **Suggestion**: Replace the IIFE approach with this simpler structure:

```typescript
// Defined alongside prevDoc, prevMarkdown, prevSelection (around line 162)
let latestTr: Transaction | null = null

const debouncedHandler = debounce(() => {
  if (!latestTr) return
  const { doc } = latestTr

  if (listeners.updated.length > 0 && prevDoc && !prevDoc.eq(doc)) {
    listeners.updated.forEach((fn) => {
      fn(ctx, doc, prevDoc!)
    })
  }

  if (
    listeners.markdownUpdated.length > 0 &&
    prevDoc &&
    !prevDoc.eq(doc)
  ) {
    const markdown = serializer(doc)
    listeners.markdownUpdated.forEach((fn) => {
      fn(ctx, markdown, prevMarkdown!)
    })
    prevMarkdown = markdown
  }

  prevDoc = doc
  latestTr = null
}, 200)

// Then inside the Plugin:
state: {
  init: (_, instance) => {
    prevDoc = instance.doc
    prevMarkdown = serializer(instance.doc)
  },
  apply: (tr) => {
    // selection handling (immediate, unchanged)
    const currentSelection = tr.selection
    if (
      (!prevSelection && currentSelection) ||
      (prevSelection && !currentSelection.eq(prevSelection))
    ) {
      listeners.selectionUpdated.forEach((fn) => {
        fn(ctx, currentSelection, prevSelection)
      })
      prevSelection = currentSelection
    }

    if (
      !(tr.docChanged || tr.storedMarksSet) ||
      tr.getMeta('addToHistory') === false
    )
      return

    latestTr = tr
    debouncedHandler()
  },
}
```

This is fewer lines, no IIFE indirection, and follows the exact same pattern as the existing `prevDoc`/`prevMarkdown`/`prevSelection` variables. The `Transaction` type import is still needed.

## Simplification Opportunities (PARETO)

### 1. NK_TMP Reproduction Tests (Phase 2) May Be Low ROI

- **Current approach**: Full Playwright setup in NK_TMP with two test cases (bug demonstration + fix verification), then ALSO a proper e2e test in Phase 4.
- **Simpler alternative**: Skip the formal Playwright tests in NK_TMP. Use the NK_TMP app purely for manual verification during development (open it in browser, type rapidly, see the counter). Write the real Playwright test only once, in the e2e suite (Phase 4). Before applying the fix, temporarily assert `> 3` to confirm the bug, then flip to `<= 3` in the same commit as the fix.
- **Value**: Eliminates an entire phase (Phase 2), its Playwright config, and a duplicate test. The e2e test in Phase 4 is the one that matters for regression prevention. The NK_TMP app still serves its purpose as a visual reproduction tool.
- **Counterargument**: If the implementor wants the discipline of "test proves bug before fix," they can run the Phase 4 e2e test with the bug assertion before committing the fix. No separate NK_TMP test infrastructure needed.
- **Verdict**: This is a nice-to-have simplification, not a blocker. The plan's approach works -- it is just more infrastructure than strictly necessary. Implementor's call.

### 2. `type Transaction` Import May Not Be Needed

- The plan says to add `type Transaction` to the import from `@milkdown/prose/state`. However, with the simpler approach (no IIFE), the `latestTr` variable can be typed as `Parameters<typeof apply>[0] | null` -- but that is worse. Actually, the simplest approach: just type it as `any` or let TypeScript infer from assignment. But explicit typing is better.
- **Verdict**: Keep the `Transaction` import. It is clean and explicit. Minor point -- just confirming the plan is correct here.

## Minor Suggestions

### 1. E2E Test: Use `expect.poll` Instead of `waitForTimeout`

The plan uses `await page.waitForTimeout(500)` to wait for the debounce timer to fire. While `waitForTimeout` is used elsewhere in this codebase (so it is consistent), Playwright's `expect.poll` is more robust and avoids flaky timing:

```typescript
await expect.poll(
  async () => debounceLogs.length,
  { timeout: 2000, intervals: [100] }
).toBeGreaterThanOrEqual(1)
```

Then assert `debounceLogs.length <= 3` after polling confirms at least one callback arrived. This is a minor improvement -- `waitForTimeout(500)` will work fine in practice given the 200ms debounce.

**Verdict**: Nice-to-have. The `waitForTimeout` approach is consistent with existing tests and acceptable.

### 2. NK_TMP Not Gitignored

The plan notes `NK_TMP` is "gitignored from npm publish" -- but `NK_TMP` is NOT in `.gitignore` (checked: `/home/nickolaykondratyev/git_repos/nickolay-kondratyev_milkdown/.gitignore` does not contain `NK_TMP`). The `NK_TMP/milkdown-debounce-bug` directory and its contents are already tracked in git (commit `0f988903`). Adding it to `pnpm-workspace.yaml` will cause pnpm to resolve its dependencies as workspace dependencies, which is fine for this use case. Just be aware that `pnpm install` at the repo root will now also install NK_TMP's dependencies.

**Verdict**: Acceptable. The NK_TMP app is intentionally committed as a reproduction tool. Just be aware of the minor workspace overhead.

### 3. The `return handler()` on Line 231

The plan correctly notes the current `return handler()` returns `undefined`. The fix correctly removes this return. Small note: ProseMirror's `StateField.apply` signature is `apply(tr: Transaction, value: T, oldState: EditorState, newState: EditorState) => T`. Since this plugin's state field type is implicitly `void`, returning `undefined` is fine in both old and new code. No issue here -- just confirming the plan's analysis.

### 4. Plan Section "10. Open Questions" Item 1

The plan asks the implementor to "confirm this is acceptable" regarding pnpm-workspace.yaml. Since this is already on a feature branch and NK_TMP is tracked, this is a non-issue. When/if this fix is submitted upstream, the pnpm-workspace.yaml change and NK_TMP would not be included.

## Strengths

1. **Root cause analysis is spot-on.** The explanation of why `debounce()` inside `apply()` creates independent timers is clear and correct. Verified against the source at `/packages/plugins/plugin-listener/src/index.ts` lines 208-231.

2. **Phased approach with verification at each step.** The plan provides concrete verification criteria for each phase, making it easy for the implementor to confirm progress.

3. **Selection handling correctly kept outside debounce.** The plan explicitly calls out that `selectionUpdated` must fire immediately per transaction, not be debounced. This is correct.

4. **`prevDoc`/`prevMarkdown` semantics are correctly analyzed.** The plan notes that with debouncing, `prevDoc` represents the state at the last emission, not intermediate states. This is the correct behavior.

5. **E2E test approach is consistent with existing patterns.** Adding a `?type=debounce` mode follows the exact same pattern as the existing `?type=markdown` and `?type=selection` modes in `/e2e/src/plugin-listener/main.ts`.

6. **Threshold of `<= 3` is well-reasoned.** The explanation of timing variance with Playwright's keyboard delay is practical and avoids flaky tests.

7. **The plan correctly identifies that `updated` and `markdownUpdated` share the same debounce issue** and are both fixed by the single code change.

## Verdict

- [x] APPROVED WITH MINOR REVISIONS

### Required Revision (Inline -- PLAN_ITERATION can be skipped)

**Replace the IIFE pattern with a simple `const` declaration** in the existing closure scope, as described in Major Concern #1 above. This is a simplification of the implementation approach, not a change to the plan's structure or phases. The implementor should define `latestTr` and `debouncedHandler` alongside `prevDoc`/`prevMarkdown`/`prevSelection` (around line 162 of `/packages/plugins/plugin-listener/src/index.ts`), before the `new Plugin({...})` call. No IIFE needed.

Everything else in the plan is sound. The phased approach, test strategy, and verification criteria are all good. The NK_TMP Playwright tests (Phase 2) are optional but not harmful if the implementor wants the extra rigor.

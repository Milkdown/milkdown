# Plan Reviewer Private Notes

## Review Session: 2026-02-09

### Key Observations

1. Bug root cause is confirmed: `debounce()` inside `apply()` creates a new wrapper per transaction. The fix (hoisting via IIFE) is the correct minimal approach.

2. NK_TMP is NOT gitignored. Adding it to pnpm-workspace.yaml means pnpm will try to manage it. This is a concern for the workspace config change -- should be noted but is acceptable for a tmp debug app.

3. The `Transaction` type import is straightforward: `@milkdown/prose/state` re-exports all of `prosemirror-state`.

4. The IIFE approach is slightly unusual but correct. An alternative would be to declare the debounced handler as a `const` before the Plugin constructor, alongside `prevDoc`, `prevMarkdown`, `prevSelection`. This would be simpler and avoid the IIFE pattern entirely.

5. The `apply` function in ProseMirror's `StateField` has signature `apply(tr, value, oldState, newState) => T`. The current code only destructures `tr`, which is fine. The return value is `undefined` (the state field holds no value), consistent with both old and new code.

6. `waitForTimeout` is used in existing e2e tests, so the plan's approach is consistent.

7. The plan correctly identifies that both `updated` and `markdownUpdated` share the same debounced block and will be fixed together.

### Simplification Opportunity Identified
The IIFE pattern can be avoided. The debounced handler can be defined alongside `prevDoc`/`prevMarkdown`/`prevSelection` (all are in the same closure scope created by the `async ()` function on line 150). This would be simpler and more readable.

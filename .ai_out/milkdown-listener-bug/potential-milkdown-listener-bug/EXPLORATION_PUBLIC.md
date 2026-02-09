# Exploration: Milkdown Listener Debounce Bug

## Bug Location
- **File**: `packages/plugins/plugin-listener/src/index.ts`, lines 208-231
- **Root cause**: `debounce()` called INSIDE `apply()`, creating a new wrapper per transaction
- **Effect**: Each keystroke creates an independent 200ms timer; no actual debouncing occurs

## Source Code (Buggy Section)
```typescript
// Line 190-232 of packages/plugins/plugin-listener/src/index.ts
apply: (tr) => {
  // selection handling (lines 191-200) - NOT buggy

  if (!(tr.docChanged || tr.storedMarksSet) || tr.getMeta('addToHistory') === false)
    return

  // BUG: NEW debounce wrapper per call = no debouncing
  const handler = debounce(() => {
    const { doc } = tr
    // ... fires updated and markdownUpdated listeners ...
    prevDoc = doc
  }, 200)

  return handler()  // independent timer, never cancelled
},
```

## Existing Test Infrastructure
1. **E2E tests**: `e2e/tests/plugin/listener.spec.ts` - Tests single-keystroke markdownUpdated and selectionUpdated
2. **E2E page**: `e2e/src/plugin-listener/main.ts` - Sets up editor with listener, logs to console
3. **Crepe listener tests**: `e2e/tests/crepe/listener.spec.ts` - Tests listener via Crepe API
4. **Existing test does NOT test rapid typing/debounce** - only single keystrokes

## Reproduction App
- **Location**: `NK_TMP/milkdown-debounce-bug/` - Vite+React scaffolding (no milkdown yet)
- **Status**: Placeholder app, needs milkdown dependencies and reproduction component

## Key Design Decisions for Fix
1. **Fix approach**: Hoist debounced function outside `apply()` using IIFE or closure
2. **Capture latest tr**: Use `latestTr` variable updated in `apply()`, read in debounced callback
3. **Selection handling**: Must remain outside the debounce (fires immediately per transaction)

## Monorepo Structure
- pnpm workspaces: `workspace:*` references between packages
- Build: Vite with custom `pluginViteConfig`
- Tests: vitest (unit), Playwright (e2e)
- E2E dev server: `http://localhost:5173`

## Existing E2E Pattern for Listener Tests
- Uses `page.waitForEvent('console')` to capture listener output
- Editor pages log listener output to console
- Test utilities in `e2e/tests/misc/index.ts`

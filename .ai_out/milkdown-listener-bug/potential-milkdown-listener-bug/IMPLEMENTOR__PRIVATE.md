# Implementor Private State

## All Phases: COMPLETE

## Environment Notes
- Node v20.18.3 is active (repo requires >= 22 but works for our purposes)
- pnpm 10.28.2 requires `COREPACK_INTEGRITY_KEYS=0` to run via corepack
- `pnpm install --no-frozen-lockfile` is needed (we modified package.json)
- Shell has `cat /etc/java-21-home` in profile that always fails; all bash exit codes include exit code 1 from this
- CI env var is set to a file path (`/home/node/dendron_ws/personal/ci.md`), must unset with `CI=` when running e2e tests

## Key Decisions Made
1. Dropped theme-nord in NK_TMP: CSS import chain requires built lib/ that doesn't exist
2. Used direct DOM manipulation (spanRef.current.textContent) instead of React state for callback count in NK_TMP
3. Used `useRef` for count to avoid stale closure issues in the listener callback
4. Per reviewer: NO IIFE pattern. Used existing closure scope for `latestTr` and `debouncedHandler`
5. Added `type Transaction` import (not runtime import, just type)

## CSS Build Artifacts for E2E
The e2e tests need two CSS files that are normally build artifacts:
- `packages/prose/lib/style/prosemirror.css` (from `node_modules/prosemirror-view/style/prosemirror.css`)
- `packages/prose/lib/style/tables.css` (from `node_modules/prosemirror-tables/style/tables.css`)
These were copied manually. They are in `.gitignore` (lib/ directory).

## Test Results Summary
- NK_TMP: 1 skipped (old bug demo), 1 passed (fix verification, callbackCount=1)
- E2E: 3 passed (markdown updated, selection updated, debounce regression)
- TSC: 19 pre-existing errors, 0 new errors

## Lockfile
- pnpm-lock.yaml was updated by install. This is expected and acceptable.

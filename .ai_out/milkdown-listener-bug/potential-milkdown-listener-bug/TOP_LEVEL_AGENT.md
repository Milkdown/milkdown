# TOP_LEVEL_AGENT: Milkdown Listener Debounce Bug

## Status: IN PROGRESS

## Feature: milkdown-listener-bug
## Branch: potential-milkdown-listener-bug

## Phase Tracking
| Phase | Status | Notes |
|-------|--------|-------|
| EXPLORATION | DONE | Bug confirmed in source code |
| CLARIFICATION | SKIPPED | Requirements are unambiguous |
| DETAILED_PLANNING | DONE | Plan in PLANNER__PUBLIC.md |
| DETAILED_PLAN_REVIEW | DONE | Approved with inline fix: drop IIFE, use existing closure scope |
| IMPLEMENTATION | DONE | Fix applied, tests pass |
| IMPLEMENTATION_REVIEW | DONE | APPROVED, no blocking issues |

## Key Context
- Bug: `debounce()` called inside `apply()` in plugin-listener/src/index.ts:208
- Fix: Hoist debounced function outside `apply()`
- Test strategy: Add e2e Playwright test for rapid typing debounce behavior
- Reproduction app goes in NK_TMP/milkdown-debounce-bug/
- Milkdown source changes must be surgical/minimal

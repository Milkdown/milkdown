import type { Slice } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import { createSlice, createTimer, type MilkdownPlugin } from '@milkdown/ctx'

import { withMeta } from '../__internal__'
import { SchemaReady } from './schema'

/// A paste rule function which takes a slice and returns a new slice.
export type PasteRule = {
  /// The function to run the paste rule.
  run: (slice: Slice, view: EditorView, isPlainText: boolean) => Slice
  /// The priority of the paste rule. Higher priority rules will be run first. Default is 50.
  priority?: number
}

/// A slice which contains the paste rules.
export const pasteRulesCtx = createSlice([] as PasteRule[], 'pasteRule')

/// A slice which stores timers that need to be waited for before starting to run the paste rule plugin.
/// By default, it's `[SchemaReady]`.
export const pasteRulesTimerCtx = createSlice([SchemaReady], 'pasteRuleTimer')

/// The timer which will be resolved when the paste rule plugin is ready.
export const PasteRulesReady = createTimer('PasteRuleReady')

/// The paste rule plugin.
/// This plugin will collect the paste rules to the editor view.
///
/// This plugin will wait for the schema plugin.
export const pasteRule: MilkdownPlugin = (ctx) => {
  ctx
    .inject(pasteRulesCtx, [])
    .inject(pasteRulesTimerCtx, [SchemaReady])
    .record(PasteRulesReady)

  return async () => {
    await ctx.waitTimers(pasteRulesTimerCtx)

    ctx.done(PasteRulesReady)

    return () => {
      ctx
        .remove(pasteRulesCtx)
        .remove(pasteRulesTimerCtx)
        .clearTimer(PasteRulesReady)
    }
  }
}

withMeta(pasteRule, {
  displayName: 'PasteRule',
})

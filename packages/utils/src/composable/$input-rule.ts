import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { SchemaReady, editorStateTimerCtx, inputRulesCtx } from '@milkdown/core'
import type { InputRule } from '@milkdown/prose/inputrules'

import { addTimer } from './utils'

/// @internal
export type $InputRule = MilkdownPlugin & {
  inputRule: InputRule
}

/// Create an input rule plugin.
/// It takes a factory function which returns a [prosemirror input rule](https://prosemirror.net/docs/ref/#inputrules.InputRule).
///
/// Additional property:
/// - `inputRule`: The prosemirror input rule created.
export function $inputRule(inputRule: (ctx: Ctx) => InputRule): $InputRule {
  const plugin: MilkdownPlugin = (ctx) => async () => {
    await ctx.wait(SchemaReady)
    const ir = inputRule(ctx)
    ctx.update(inputRulesCtx, (irs) => [...irs, ir])
    ;(<$InputRule>plugin).inputRule = ir

    return () => {
      ctx.update(inputRulesCtx, (irs) => irs.filter((x) => x !== ir))
    }
  }

  return <$InputRule>plugin
}

/// The async version for `$inputRule`. You can use `await` in the factory when creating the input rule.
///
/// Additional property:
/// - `inputRule`: The prosemirror input rule created.
/// - `timer`: The timer which will be resolved when the input rule is ready.
export function $inputRuleAsync(
  inputRule: (ctx: Ctx) => Promise<InputRule>,
  timerName?: string
) {
  return addTimer<$InputRule>(
    async (ctx, plugin) => {
      await ctx.wait(SchemaReady)
      const ir = await inputRule(ctx)
      ctx.update(inputRulesCtx, (irs) => [...irs, ir])
      plugin.inputRule = ir
      return () => {
        ctx.update(inputRulesCtx, (irs) => irs.filter((x) => x !== ir))
      }
    },
    editorStateTimerCtx,
    timerName
  )
}

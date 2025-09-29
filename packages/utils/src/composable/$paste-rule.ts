import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'

import {
  pasteRulesCtx,
  pasteRulesTimerCtx,
  SchemaReady,
  type PasteRule,
} from '@milkdown/core'

import { addTimer } from './utils'

/// @internal
export type $PasteRule = MilkdownPlugin & {
  pasteRule: PasteRule
}

/// Create a paste rule plugin.
/// It takes a factory function which returns a paste rule.
///
/// Additional property:
/// - `pasteRule`: The paste rule created.
export function $pasteRule(pasteRule: (ctx: Ctx) => PasteRule): $PasteRule {
  const plugin: MilkdownPlugin = (ctx) => async () => {
    await ctx.wait(SchemaReady)
    const pr = pasteRule(ctx)
    ctx.update(pasteRulesCtx, (prs) => [...prs, pr])
    ;(<$PasteRule>plugin).pasteRule = pr

    return () => {
      ctx.update(pasteRulesCtx, (prs) => prs.filter((x) => x !== pr))
    }
  }

  return <$PasteRule>plugin
}

/// The async version for `$pasteRule`. You can use `await` in the factory when creating the paste rule.
///
/// Additional property:
/// - `pasteRule`: The paste rule created.
/// - `timer`: The timer which will be resolved when the paste rule is ready.
export function $pasteRuleAsync(
  pasteRule: (ctx: Ctx) => Promise<PasteRule>,
  timerName?: string
) {
  return addTimer<$PasteRule>(
    async (ctx, plugin) => {
      await ctx.wait(SchemaReady)
      const pr = await pasteRule(ctx)
      ctx.update(pasteRulesCtx, (prs) => [...prs, pr])
      plugin.pasteRule = pr
      return () => {
        ctx.update(pasteRulesCtx, (prs) => prs.filter((x) => x !== pr))
      }
    },
    pasteRulesTimerCtx,
    timerName
  )
}

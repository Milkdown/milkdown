// Minimal $component utility for registering custom node views/components
import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import type { NodeViewConstructor } from '@milkdown/prose/view'

import { nodeViewCtx, SchemaReady } from '@milkdown/core'

export function $component(
  id: string,
  factory: (ctx: Ctx) => {
    component: any
    as?: string
    shouldUpdate?: (prev: any, next: any) => boolean
  }
): MilkdownPlugin {
  return (ctx) => async () => {
    await ctx.wait(SchemaReady)
    const { component } = factory(ctx)
    const nodeView: NodeViewConstructor = (node, view, getPos) => {
      return new component(node, view, getPos, ctx)
    }
    ctx.update(nodeViewCtx, (ps) => [
      ...ps,
      [id, nodeView] as [string, NodeViewConstructor],
    ])
    return () => {
      ctx.update(nodeViewCtx, (ps) => ps.filter((x) => x[0] !== id))
    }
  }
}

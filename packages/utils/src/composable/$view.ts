import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import {
  SchemaReady,
  editorViewTimerCtx,
  markViewCtx,
  nodeViewCtx,
} from '@milkdown/core'
import { NodeType } from '@milkdown/prose/model'
import type {
  MarkViewConstructor,
  NodeViewConstructor,
} from '@milkdown/prose/view'

import { addTimer } from './utils'
import type { $Mark, $Node } from '.'

/// @internal
export type $View<
  T extends $Node | $Mark,
  V extends NodeViewConstructor | MarkViewConstructor,
> = MilkdownPlugin & {
  view: V
  type: T
}

/// @internal
export type GetConstructor<T extends $Node | $Mark> = T extends $Node
  ? NodeViewConstructor
  : T extends $Mark
    ? MarkViewConstructor
    : NodeViewConstructor | MarkViewConstructor

/// Create a [prosemirror node/mark view](https://prosemirror.net/docs/ref/#view.NodeView) plugin.
/// It takes two arguments
/// - `type`: The node/mark plugin that needs to add a view.
/// - `view`: The factory that creates the view. It should return a function that returns a [node/mark view constructor](https://prosemirror.net/docs/ref/#view.NodeView).
///
/// Additional property:
/// - `view`: The view created.
/// - `type`: The node/mark plugin that needs to add a view.
export function $view<
  T extends $Node | $Mark,
  V extends NodeViewConstructor | MarkViewConstructor = GetConstructor<T>,
>(type: T, view: (ctx: Ctx) => V): $View<T, V> {
  const plugin: MilkdownPlugin = (ctx) => async () => {
    await ctx.wait(SchemaReady)
    const v = view(ctx)
    if (type.type(ctx) instanceof NodeType)
      ctx.update(nodeViewCtx, (ps) => [
        ...ps,
        [type.id, v] as [string, NodeViewConstructor],
      ])
    else
      ctx.update(markViewCtx, (ps) => [
        ...ps,
        [type.id, v] as [string, MarkViewConstructor],
      ])
    ;(<$View<T, V>>plugin).view = v
    ;(<$View<T, V>>plugin).type = type

    return () => {
      if (type.type(ctx) instanceof NodeType)
        ctx.update(nodeViewCtx, (ps) => ps.filter((x) => x[0] !== type.id))
      else ctx.update(markViewCtx, (ps) => ps.filter((x) => x[0] !== type.id))
    }
  }

  return <$View<T, V>>plugin
}

/// The async version for `$view`. You can use `await` in the factory when creating the view.
///
/// Additional property:
/// - `view`: The view created.
/// - `type`: The node/mark plugin that needs to add a view.
/// - `timer`: The timer which will be resolved when the view is ready.
export function $viewAsync<
  T extends $Node | $Mark,
  V extends NodeViewConstructor | MarkViewConstructor = GetConstructor<T>,
>(type: T, view: (ctx: Ctx) => Promise<V>, timerName?: string) {
  return addTimer<$View<T, V>>(
    async (ctx, plugin) => {
      await ctx.wait(SchemaReady)
      const v = await view(ctx)
      if (type.type(ctx) instanceof NodeType)
        ctx.update(nodeViewCtx, (ps) => [
          ...ps,
          [type.id, v] as [string, NodeViewConstructor],
        ])
      else
        ctx.update(markViewCtx, (ps) => [
          ...ps,
          [type.id, v] as [string, MarkViewConstructor],
        ])

      plugin.view = v
      plugin.type = type

      return () => {
        if (type.type(ctx) instanceof NodeType)
          ctx.update(nodeViewCtx, (ps) => ps.filter((x) => x[0] !== type.id))
        else ctx.update(markViewCtx, (ps) => ps.filter((x) => x[0] !== type.id))
      }
    },
    editorViewTimerCtx,
    timerName
  )
}

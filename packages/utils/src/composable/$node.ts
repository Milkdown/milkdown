import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { nodesCtx, schemaCtx, schemaTimerCtx } from '@milkdown/core'
import { missingNodeInSchema } from '@milkdown/exception'
import type { NodeType } from '@milkdown/prose/model'

import type { NodeSchema } from '@milkdown/transformer'
import { addTimer } from './utils'

/// @internal
export type $Node = MilkdownPlugin & {
  id: string
  schema: NodeSchema
  type: (ctx: Ctx) => NodeType
}

/// Create a node plugin.
/// It takes a node id and a factory function.
/// The factory should return a function that returns a [node schema](/transformer#interface-nodeschema).
///
/// Additional property:
/// - `id`: The id of the node.
/// - `schema`: The node schema created.
/// - `type`: A function that will return the [prosemirror node type](https://prosemirror.net/docs/ref/#model.NodeType).
export function $node(id: string, schema: (ctx: Ctx) => NodeSchema): $Node {
  const plugin: MilkdownPlugin = (ctx) => async () => {
    const nodeSchema = schema(ctx)
    ctx.update(nodesCtx, (ns) => [
      ...ns.filter((n) => n[0] !== id),
      [id, nodeSchema] as [string, NodeSchema],
    ])
    ;(<$Node>plugin).id = id
    ;(<$Node>plugin).schema = nodeSchema

    return () => {
      ctx.update(nodesCtx, (ns) => ns.filter(([x]) => x !== id))
    }
  }

  ;(<$Node>plugin).type = (ctx) => {
    const nodeType = ctx.get(schemaCtx).nodes[id]
    if (!nodeType) throw missingNodeInSchema(id)

    return nodeType
  }

  return <$Node>plugin
}

/// The async version for `$node`. You can use `await` in the factory when creating the node schema.
///
/// Additional property:
/// - `id`: The id of the node.
/// - `schema`: The node schema created.
/// - `type`: A function that will return the [prosemirror node type](https://prosemirror.net/docs/ref/#model.NodeType).
/// - `timer`: The timer which will be resolved when the node schema is ready.
export function $nodeAsync(
  id: string,
  schema: (ctx: Ctx) => Promise<NodeSchema>,
  timerName?: string
) {
  const plugin = addTimer<$Node>(
    async (ctx, plugin, done) => {
      const nodeSchema = await schema(ctx)
      ctx.update(nodesCtx, (ns) => [
        ...ns.filter((n) => n[0] !== id),
        [id, nodeSchema] as [string, NodeSchema],
      ])

      plugin.id = id
      plugin.schema = nodeSchema
      done()

      return () => {
        ctx.update(nodesCtx, (ns) => ns.filter(([x]) => x !== id))
      }
    },
    schemaTimerCtx,
    timerName
  )

  plugin.type = (ctx) => {
    const nodeType = ctx.get(schemaCtx).nodes[id]
    if (!nodeType) throw missingNodeInSchema(id)

    return nodeType
  }

  return plugin
}

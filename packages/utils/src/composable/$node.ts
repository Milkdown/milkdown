/* Copyright 2021, Milkdown by Mirone. */
import type {
  Ctx,
  MilkdownPlugin,
} from '@milkdown/ctx'
import {
  SchemaReady,
  nodesCtx,
  schemaCtx,
  schemaTimerCtx,
} from '@milkdown/core'
import { missingNodeInSchema } from '@milkdown/exception'
import type { NodeType } from '@milkdown/prose/model'

import type { NodeSchema } from '@milkdown/transformer'
import { addTimer } from './utils'

export type $Node = MilkdownPlugin & {
  id: string
  schema: NodeSchema
  type: () => NodeType
}

export const $node = (id: string, schema: (ctx: Ctx) => NodeSchema): $Node => {
  let nodeType: NodeType | undefined
  const plugin: MilkdownPlugin = ctx => async () => {
    const nodeSchema = schema(ctx)
    ctx.update(nodesCtx, ns => [...ns.filter(n => n[0] !== id), [id, nodeSchema] as [string, NodeSchema]]);

    (<$Node>plugin).id = id;
    (<$Node>plugin).schema = nodeSchema

    await ctx.wait(SchemaReady)

    nodeType = ctx.get(schemaCtx).nodes[id]
    if (!nodeType)
      throw missingNodeInSchema(id)

    return () => {
      ctx.update(nodesCtx, ns => ns.filter(([x]) => x !== id))
    }
  }
  (<$Node>plugin).type = () => nodeType!

  return <$Node>plugin
}

export const $nodeAsync = (id: string, schema: (ctx: Ctx) => Promise<NodeSchema>, timerName?: string) => {
  let nodeType: NodeType | undefined
  const plugin = addTimer<$Node>(
    async (ctx, plugin, done) => {
      const nodeSchema = await schema(ctx)
      ctx.update(nodesCtx, ns => [...ns.filter(n => n[0] !== id), [id, nodeSchema] as [string, NodeSchema]])

      plugin.id = id
      plugin.schema = nodeSchema
      done()

      await ctx.wait(SchemaReady)

      nodeType = ctx.get(schemaCtx).nodes[id]
      if (!nodeType)
        throw missingNodeInSchema(id)

      return () => {
        ctx.update(nodesCtx, ns => ns.filter(([x]) => x !== id))
      }
    },
    schemaTimerCtx,
    timerName,
  )
  plugin.type = () => nodeType!
  return plugin
}

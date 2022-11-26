/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin, NodeSchema } from '@milkdown/core'
import { nodesCtx } from '@milkdown/core'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Node } from '../$node'
import { $node } from '../$node'

type GetSchema = (ctx: Ctx) => NodeSchema

export type $NodeSchema = [
  schemaCtx: $Ctx<GetSchema, string>,
  schema: $Node,
] & {
  id: $Node['id']
  type: $Node['type']
  node: $Node
  schema: NodeSchema
  ctx: $Ctx<GetSchema, string>['slice']
  extendSchema: (handler: (prev: GetSchema) => GetSchema) => MilkdownPlugin
}

export const $nodeSchema = (id: string, schema: GetSchema): $NodeSchema => {
  const schemaCtx = $ctx(schema, `${id}Schema`)

  const nodeSchema = $node(id, (ctx) => {
    const userSchema = ctx.get(schemaCtx.slice)
    return userSchema(ctx)
  })

  const result = [schemaCtx, nodeSchema] as $NodeSchema
  result.id = nodeSchema.id
  result.node = nodeSchema
  result.type = nodeSchema.type
  result.schema = nodeSchema.schema
  result.ctx = schemaCtx.slice
  result.extendSchema = (handler): MilkdownPlugin => {
    return () => (ctx) => {
      const prev = ctx.get(schemaCtx.slice)
      const next = handler(prev)
      const nodeSchema = next(ctx)
      ctx.update(nodesCtx, ns => [...ns.filter(n => n[0] !== id), [id, nodeSchema] as [string, NodeSchema]])
      result.schema = nodeSchema
    }
  }

  return result
}

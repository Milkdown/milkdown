/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { nodesCtx } from '@milkdown/core'
import type { NodeSchema } from '@milkdown/transformer'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Node } from '../$node'
import { $node } from '../$node'

export type GetSchema = (ctx: Ctx) => NodeSchema

export type $NodeSchema<T extends string> = [
  schemaCtx: $Ctx<GetSchema, T>,
  schema: $Node,
] & {
  id: $Node['id']
  type: $Node['type']
  node: $Node
  schema: NodeSchema
  key: $Ctx<GetSchema, T>['key']
  extendSchema: (handler: (prev: GetSchema) => GetSchema) => MilkdownPlugin
}

export const $nodeSchema = <T extends string>(id: T, schema: GetSchema): $NodeSchema<T> => {
  const schemaCtx = $ctx(schema, id)

  const nodeSchema = $node(id, (ctx) => {
    const userSchema = ctx.get(schemaCtx.key)
    return userSchema(ctx)
  })

  const result = [schemaCtx, nodeSchema] as $NodeSchema<T>
  result.id = nodeSchema.id
  result.node = nodeSchema
  result.type = nodeSchema.type
  result.schema = nodeSchema.schema
  result.key = schemaCtx.key
  result.extendSchema = (handler): MilkdownPlugin => {
    return ctx => () => {
      const prev = ctx.get(schemaCtx.key)
      const next = handler(prev)
      const nodeSchema = next(ctx)
      ctx.update(nodesCtx, ns => [...ns.filter(n => n[0] !== id), [id, nodeSchema] as [string, NodeSchema]])
      result.schema = nodeSchema
    }
  }

  return result
}

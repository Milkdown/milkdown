/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, NodeSchema } from '@milkdown/core'
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
  schema: NodeSchema
  ctx: $Ctx<GetSchema, string>['slice']
  extendSchema: (handler: (prev: GetSchema) => GetSchema) => $NodeSchema
}

export const $nodeSchema = (id: string, schema: GetSchema): $NodeSchema => {
  const schemaCtx = $ctx(schema, `${id}Schema`)

  const nodeSchema = $node(id, (ctx) => {
    const userSchema = ctx.get(schemaCtx.slice)
    return userSchema(ctx)
  })

  const result = [schemaCtx, nodeSchema] as $NodeSchema
  result.id = nodeSchema.id
  result.type = nodeSchema.type
  result.schema = nodeSchema.schema
  result.ctx = schemaCtx.slice
  result.extendSchema = (handler) => {
    const newNodeSchema = $node(id, (ctx) => {
      ctx.update(schemaCtx.slice, prev => handler(prev))
      const userSchema = ctx.get(schemaCtx.slice)
      return userSchema(ctx)
    })

    result[1] = newNodeSchema
    result.id = newNodeSchema.id
    result.type = newNodeSchema.type
    result.schema = newNodeSchema.schema

    return result
  }

  return result
}

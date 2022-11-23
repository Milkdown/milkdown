/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, NodeSchema } from '@milkdown/core'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Node } from '../$node'
import { $node } from '../$node'

export type $NodeSchema = [
  schemaCtx: $Ctx<(ctx: Ctx) => NodeSchema, string>,
  schema: $Node,
] & {
  id: $Node['id']
  type: $Node['type']
  schema: NodeSchema
  ctx: $Ctx<(ctx: Ctx) => NodeSchema, string>['slice']
}

export const $nodeSchema = (id: string, schema: (ctx: Ctx) => NodeSchema): $NodeSchema => {
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

  return result
}

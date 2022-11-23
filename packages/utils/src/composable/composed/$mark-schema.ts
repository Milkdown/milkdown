/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MarkSchema } from '@milkdown/core'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Mark } from '../$mark'
import { $mark } from '../$mark'

export type $MarkSchema = [
  schemaCtx: $Ctx<(ctx: Ctx) => MarkSchema, string>,
  schema: $Mark,
] & {
  id: $Mark['id']
  type: $Mark['type']
  schema: MarkSchema
  ctx: $Ctx<(ctx: Ctx) => MarkSchema, string>['slice']
}

export const $markSchema = (id: string, schema: (ctx: Ctx) => MarkSchema): $MarkSchema => {
  const schemaCtx = $ctx(schema, `${id}Schema`)

  const markSchema = $mark(id, (ctx) => {
    const userSchema = ctx.get(schemaCtx.slice)
    return userSchema(ctx)
  })

  const result = [schemaCtx, markSchema] as $MarkSchema
  result.id = markSchema.id
  result.type = markSchema.type
  result.schema = markSchema.schema
  result.ctx = schemaCtx.slice

  return result
}

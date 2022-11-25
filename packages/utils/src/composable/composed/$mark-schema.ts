/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MarkSchema } from '@milkdown/core'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Mark } from '../$mark'
import { $mark } from '../$mark'

type GetSchema = (ctx: Ctx) => MarkSchema

export type $MarkSchema = [
  schemaCtx: $Ctx<GetSchema, string>,
  schema: $Mark,
] & {
  id: $Mark['id']
  type: $Mark['type']
  schema: MarkSchema
  ctx: $Ctx<GetSchema, string>['slice']
  extendSchema: (handler: (prev: GetSchema) => GetSchema) => $MarkSchema
}

export const $markSchema = (id: string, schema: GetSchema): $MarkSchema => {
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
  result.extendSchema = (handler) => {
    const newMarkSchema = $mark(id, (ctx) => {
      ctx.update(schemaCtx.slice, prev => handler(prev))
      const userSchema = ctx.get(schemaCtx.slice)
      return userSchema(ctx)
    })

    result[1] = newMarkSchema
    result.id = newMarkSchema.id
    result.type = newMarkSchema.type
    result.schema = newMarkSchema.schema

    return result
  }

  return result
}

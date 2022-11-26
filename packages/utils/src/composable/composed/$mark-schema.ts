/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MarkSchema, MilkdownPlugin } from '@milkdown/core'
import { marksCtx } from '@milkdown/core'
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
  mark: $Mark
  schema: MarkSchema
  ctx: $Ctx<GetSchema, string>['slice']
  extendSchema: (handler: (prev: GetSchema) => GetSchema) => MilkdownPlugin
}

export const $markSchema = (id: string, schema: GetSchema): $MarkSchema => {
  const schemaCtx = $ctx(schema, `${id}Schema`)

  const markSchema = $mark(id, (ctx) => {
    const userSchema = ctx.get(schemaCtx.slice)
    return userSchema(ctx)
  })

  const result = [schemaCtx, markSchema] as $MarkSchema
  result.id = markSchema.id
  result.mark = markSchema
  result.type = markSchema.type
  result.schema = markSchema.schema
  result.ctx = schemaCtx.slice
  result.extendSchema = (handler): MilkdownPlugin => {
    return () => (ctx) => {
      const prev = ctx.get(schemaCtx.slice)
      const next = handler(prev)
      const markSchema = next(ctx)
      ctx.update(marksCtx, ms => [...ms.filter(m => m[0] !== id), [id, markSchema] as [string, MarkSchema]])
      result.schema = markSchema
    }
  }

  return result
}

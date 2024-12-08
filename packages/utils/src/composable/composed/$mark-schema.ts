import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { marksCtx } from '@milkdown/core'
import type { MarkSchema } from '@milkdown/transformer'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Mark } from '../$mark'
import { $mark } from '../$mark'

/// @internal
export type GetMarkSchema = (ctx: Ctx) => MarkSchema

/// @internal
export type $MarkSchema<T extends string> = [
  schemaCtx: $Ctx<GetMarkSchema, T>,
  schema: $Mark,
] & {
  id: $Mark['id']
  type: $Mark['type']
  mark: $Mark
  ctx: $Ctx<GetMarkSchema, T>
  schema: MarkSchema
  key: $Ctx<GetMarkSchema, T>['key']
  extendSchema: (
    handler: (prev: GetMarkSchema) => GetMarkSchema
  ) => MilkdownPlugin
}

/// Create a plugin for mark schema.
/// The first parameter is the id of the mark schema.
/// The second parameter is the function that returns the mark schema.
///
/// The function will return a plugin with additional properties:
/// - `id`: The id of the mark schema.
/// - `type`: A function witch will return the type of the mark schema.
/// - `ctx`: The context of the mark schema.
/// - `mark`: The mark schema plugin.
/// - `schema`: The mark schema.
/// - `key`: The key of slice which contains the mark schema factory.
/// - `extendSchema`: A function witch will return a plugin that can extend the mark schema.
export function $markSchema<T extends string>(
  id: T,
  schema: GetMarkSchema
): $MarkSchema<T> {
  const schemaCtx = $ctx(schema, id)

  const markSchema = $mark(id, (ctx) => {
    const userSchema = ctx.get(schemaCtx.key)
    return userSchema(ctx)
  })

  const result = [schemaCtx, markSchema] as $MarkSchema<T>
  result.id = markSchema.id
  result.mark = markSchema
  result.type = markSchema.type
  result.schema = markSchema.schema
  result.ctx = schemaCtx
  result.key = schemaCtx.key
  result.extendSchema = (handler): MilkdownPlugin => {
    return (ctx) => () => {
      const prev = ctx.get(schemaCtx.key)
      const next = handler(prev)
      const markSchema = next(ctx)
      ctx.update(marksCtx, (ms) => [
        ...ms.filter((m) => m[0] !== id),
        [id, markSchema] as [string, MarkSchema],
      ])
      result.schema = markSchema
    }
  }

  return result
}

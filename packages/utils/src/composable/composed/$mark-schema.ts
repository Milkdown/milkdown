import type { Ctx } from '@milkdown/ctx'
import type { MarkSchema } from '@milkdown/transformer'

import type { $Ctx } from '../$ctx'
import type { $Mark } from '../$mark'

import { $ctx } from '../$ctx'
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
  key: $Ctx<GetMarkSchema, T>['key']
  extendSchema: (
    handler: (prev: GetMarkSchema) => GetMarkSchema
  ) => $MarkSchema<T>
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

  result.type = (ctx: Ctx) => markSchema.type(ctx)
  result.ctx = schemaCtx
  result.key = schemaCtx.key
  result.extendSchema = (handler) => {
    const nextSchema = handler(schema)

    return $markSchema(id, nextSchema)
  }

  return result
}

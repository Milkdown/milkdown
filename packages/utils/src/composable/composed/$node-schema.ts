import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { nodesCtx } from '@milkdown/core'
import type { NodeSchema } from '@milkdown/transformer'
import type { $Ctx } from '../$ctx'
import { $ctx } from '../$ctx'
import type { $Node } from '../$node'
import { $node } from '../$node'

/// @internal
export type GetNodeSchema = (ctx: Ctx) => NodeSchema

/// @internal
export type $NodeSchema<T extends string> = [
  schemaCtx: $Ctx<GetNodeSchema, T>,
  schema: $Node,
] & {
  id: $Node['id']
  type: $Node['type']
  node: $Node
  ctx: $Ctx<GetNodeSchema, T>
  schema: NodeSchema
  key: $Ctx<GetNodeSchema, T>['key']
  extendSchema: (
    handler: (prev: GetNodeSchema) => GetNodeSchema
  ) => MilkdownPlugin
}

/// Create a plugin for node schema.
/// The first parameter is the id of the node schema.
/// The second parameter is the function that returns the node schema.
///
/// The function will return a plugin with additional properties:
/// - `id`: The id of the node schema.
/// - `type`: A function witch will return the type of the node schema.
/// - `ctx`: The context of the node schema.
/// - `node`: The node schema plugin.
/// - `schema`: The node schema.
/// - `key`: The key of slice which contains the node schema factory.
/// - `extendSchema`: A function witch will return a plugin that can extend the node schema.
export function $nodeSchema<T extends string>(
  id: T,
  schema: GetNodeSchema
): $NodeSchema<T> {
  const schemaCtx = $ctx(schema, id)

  const nodeSchema = $node(id, (ctx) => {
    const userSchema = ctx.get(schemaCtx.key)
    return userSchema(ctx)
  })

  const result = [schemaCtx, nodeSchema] as $NodeSchema<T>
  result.id = nodeSchema.id
  result.node = nodeSchema

  result.type = (ctx: Ctx) => nodeSchema.type(ctx)
  result.schema = nodeSchema.schema
  result.ctx = schemaCtx
  result.key = schemaCtx.key
  result.extendSchema = (handler): MilkdownPlugin => {
    return (ctx) => () => {
      const prev = ctx.get(schemaCtx.key)
      const next = handler(prev)
      const nodeSchema = next(ctx)
      ctx.update(nodesCtx, (ns) => [
        ...ns.filter((n) => n[0] !== id),
        [id, nodeSchema] as [string, NodeSchema],
      ])
      result.schema = nodeSchema
    }
  }

  return result
}

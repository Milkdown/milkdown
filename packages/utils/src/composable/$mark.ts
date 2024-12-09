import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import type { MarkSchema } from '@milkdown/transformer'
import { marksCtx, schemaCtx, schemaTimerCtx } from '@milkdown/core'
import { missingMarkInSchema } from '@milkdown/exception'
import type { MarkType } from '@milkdown/prose/model'

import { addTimer } from './utils'

/// @internal
export type $Mark = MilkdownPlugin & {
  id: string
  schema: MarkSchema
  type: (ctx: Ctx) => MarkType
}

/// Create a mark plugin.
/// It takes a mark id and a factory function.
/// The factory should return a function that returns a [mark schema](/transformer#interface-markschema).
///
/// Additional property:
/// - `id`: The id of the mark.
/// - `schema`: The mark schema created.
/// - `type`: A function that will return the [prosemirror mark type](https://prosemirror.net/docs/ref/#model.MarkType).
export function $mark(id: string, schema: (ctx: Ctx) => MarkSchema): $Mark {
  const plugin: MilkdownPlugin = (ctx) => async () => {
    const markSchema = schema(ctx)
    ctx.update(marksCtx, (ns) => [
      ...ns.filter((n) => n[0] !== id),
      [id, markSchema] as [string, MarkSchema],
    ])
    ;(<$Mark>plugin).id = id
    ;(<$Mark>plugin).schema = markSchema

    return () => {
      ctx.update(marksCtx, (ns) => ns.filter(([x]) => x !== id))
    }
  }
  ;(<$Mark>plugin).type = (ctx) => {
    const markType = ctx.get(schemaCtx).marks[id]
    if (!markType) throw missingMarkInSchema(id)
    return markType
  }

  return <$Mark>plugin
}

/// The async version for `$mark`. You can use `await` in the factory when creating the mark schema.
///
/// Additional property:
/// - `id`: The id of the mark.
/// - `schema`: The mark schema created.
/// - `type`: A function that will return the [prosemirror mark type](https://prosemirror.net/docs/ref/#model.MarkType).
/// - `timer`: The timer which will be resolved when the mark schema is ready.
export function $markAsync(
  id: string,
  schema: (ctx: Ctx) => Promise<MarkSchema>,
  timerName?: string
) {
  const plugin = addTimer<$Mark>(
    async (ctx, plugin, done) => {
      const markSchema = await schema(ctx)
      ctx.update(marksCtx, (ns) => [
        ...ns.filter((n) => n[0] !== id),
        [id, markSchema] as [string, MarkSchema],
      ])

      plugin.id = id
      plugin.schema = markSchema
      done()

      return () => {
        ctx.update(marksCtx, (ns) => ns.filter(([x]) => x !== id))
      }
    },
    schemaTimerCtx,
    timerName
  )

  plugin.type = (ctx) => {
    const markType = ctx.get(schemaCtx).marks[id]
    if (!markType) throw missingMarkInSchema(id)
    return markType
  }

  return plugin
}

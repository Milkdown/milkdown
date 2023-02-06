/* Copyright 2021, Milkdown by Mirone. */
import type {
  Ctx,
  MilkdownPlugin,
} from '@milkdown/ctx'
import type { MarkSchema } from '@milkdown/transformer'
import {
  SchemaReady,
  marksCtx,
  schemaCtx,
  schemaTimerCtx,
} from '@milkdown/core'
import { missingMarkInSchema } from '@milkdown/exception'
import type { MarkType } from '@milkdown/prose/model'

import { addTimer } from './utils'

export type $Mark = MilkdownPlugin & {
  id: string
  schema: MarkSchema
  type: () => MarkType
}

export const $mark = (id: string, schema: (ctx: Ctx) => MarkSchema): $Mark => {
  let markType: MarkType | undefined
  const plugin: MilkdownPlugin = ctx => async () => {
    const markSchema = schema(ctx)
    ctx.update(marksCtx, ns => [...ns.filter(n => n[0] !== id), [id, markSchema] as [string, MarkSchema]]);

    (<$Mark>plugin).id = id;
    (<$Mark>plugin).schema = markSchema

    await ctx.wait(SchemaReady)

    markType = ctx.get(schemaCtx).marks[id]
    if (!markType)
      throw missingMarkInSchema(id)

    return () => {
      ctx.update(marksCtx, ns => ns.filter(([x]) => x !== id))
    }
  }
  (<$Mark>plugin).type = () => markType!

  return <$Mark>plugin
}

export const $markAsync = (id: string, schema: (ctx: Ctx) => Promise<MarkSchema>, timerName?: string) => {
  let markType: MarkType | undefined
  const plugin = addTimer<$Mark>(
    async (ctx, plugin, done) => {
      const markSchema = await schema(ctx)
      ctx.update(marksCtx, ns => [...ns.filter(n => n[0] !== id), [id, markSchema] as [string, MarkSchema]])

      plugin.id = id
      plugin.schema = markSchema
      done()

      await ctx.wait(SchemaReady)

      const markType = ctx.get(schemaCtx).marks[id]
      if (!markType)
        throw missingMarkInSchema(id)

      return () => {
        ctx.update(marksCtx, ns => ns.filter(([x]) => x !== id))
      }
    },
    schemaTimerCtx,
    timerName,
  )
  plugin.type = () => markType!

  return plugin
}

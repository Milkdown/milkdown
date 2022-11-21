/* Copyright 2021, Milkdown by Mirone. */
import type {
  Ctx,
  MarkSchema,
  NodeSchema,
} from '@milkdown/core'
import {
  SchemaReady, createSlice, marksCtx, nodesCtx, schemaCtx,
} from '@milkdown/core'
import type { Maybe } from '../../types'

import type { Pipeline } from '../pipeline'
import { typePipeCtx } from './type'

export type UserSchema = (ctx: Ctx) => {
  node?: Record<string, NodeSchema>
  mark?: Record<string, MarkSchema>
}
export const getSchemaPipeCtx = createSlice<Maybe<UserSchema>>(undefined, 'getSchemaPipeCtx')
export const applySchema: Pipeline = async (env, next) => {
  const { ctx, pipelineCtx, onCleanup } = env

  const getSchema = pipelineCtx.get(getSchemaPipeCtx)

  const userSchema = getSchema?.(env.ctx) ?? {}

  let node: Record<string, NodeSchema> = {}
  let mark: Record<string, MarkSchema> = {}

  if (userSchema.node) {
    node = userSchema.node
    const nodes = Object.entries<NodeSchema>(userSchema.node)
    ctx.update(nodesCtx, ns => [...ns, ...nodes])
    onCleanup(() => {
      ctx.update(nodesCtx, ns => ns.filter(n => !nodes.includes(n)))
    })
  }

  if (userSchema.mark) {
    mark = userSchema.mark
    const marks = Object.entries<MarkSchema>(userSchema.mark)
    ctx.update(marksCtx, ms => [...ms, ...marks])
    onCleanup(() => {
      ctx.update(marksCtx, ms => ms.filter(m => !marks.includes(m)))
    })
  }

  await ctx.wait(SchemaReady)

  const schema = ctx.get(schemaCtx)
  const nodeTypes = Object.keys(node).map(id => [id, schema.nodes[id]] as const)
  const markTypes = Object.keys(mark).map(id => [id, schema.marks[id]] as const)

  const type = Object.fromEntries([...nodeTypes, ...markTypes])
  pipelineCtx.set(typePipeCtx, type)

  await next()
}

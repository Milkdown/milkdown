/* Copyright 2021, Milkdown by Mirone. */
import type {
  Ctx,
} from '@milkdown/core'
import {
  createSlice, markViewCtx, marksCtx, nodeViewCtx, nodesCtx,
} from '@milkdown/core'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'
import type { Maybe } from '../../types'

import type { Pipeline } from '../pipeline'
import type { PluginView } from './options'
import { optionsPipeCtx } from './options'

export const getViewPipeCtx = createSlice<Maybe<(ctx: Ctx) => PluginView>>(undefined, 'getViewPipeCtx')
export const applyView: Pipeline = async (env, next) => {
  const { pipelineCtx, ctx, onCleanup } = env

  const getView = pipelineCtx.get(getViewPipeCtx)

  const options = pipelineCtx.get(optionsPipeCtx)

  const view = options.view ? options.view(ctx) : getView?.(ctx)

  if (view) {
    const nodeViews = Object.entries(view).filter(
      ([id]) => ctx.get(nodesCtx).findIndex(ns => ns[0] === id) !== -1,
    )
    const markViews = Object.entries(view).filter(
      ([id]) => ctx.get(marksCtx).findIndex(ns => ns[0] === id) !== -1,
    )
    ctx.update(nodeViewCtx, v => [...v, ...(nodeViews as [string, NodeViewConstructor][])])
    ctx.update(markViewCtx, v => [...v, ...(markViews as [string, MarkViewConstructor][])])

    onCleanup(() => {
      ctx.update(nodeViewCtx, v => v.filter(x => !nodeViews.includes(x)))
      ctx.update(markViewCtx, v => v.filter(x => !markViews.includes(x)))
    })
  }

  await next()
}

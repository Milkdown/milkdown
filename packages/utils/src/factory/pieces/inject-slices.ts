/* Copyright 2021, Milkdown by Mirone. */
import {
  createSlice,
} from '@milkdown/core'

import type { AnySlice } from '../../types'
import type { Pipeline } from '../pipeline'

export const injectSlicesPipeCtx = createSlice<AnySlice[]>([], 'injectPipeCtx')
export const injectSlices: Pipeline = async (env, next) => {
  const { pipelineCtx, onCleanup, pre } = env
  const inject = pipelineCtx.get(injectSlicesPipeCtx)
  if (inject) {
    inject.forEach(slice => pre.inject(slice))
    onCleanup((post) => {
      inject.forEach(slice => post.remove(slice))
    })
  }
  await next()
}

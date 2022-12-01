/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import {
  EditorViewReady,
  createSlice, createTimer,
} from '@milkdown/core'

import { CollabService } from './collab-service'

export const collabServiceCtx = createSlice(new CollabService(), 'collabServiceCtx')
export const CollabReady = createTimer('CollabReady')

export const collaborative: MilkdownPlugin = (pre) => {
  const collabService = new CollabService()
  pre.inject(collabServiceCtx, collabService).record(CollabReady)
  return async (ctx) => {
    await ctx.wait(EditorViewReady)
    collabService.bindCtx(ctx)
    ctx.done(CollabReady)
  }
}

export * from 'y-prosemirror'
export { CollabService } from './collab-service'


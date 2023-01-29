/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import {
  EditorViewReady,
  createSlice, createTimer,
} from '@milkdown/core'

import { CollabService } from './collab-service'

export const collabServiceCtx = createSlice(new CollabService(), 'collabServiceCtx')
export const CollabReady = createTimer('CollabReady')

export const collaborative: MilkdownPlugin = (ctx) => {
  const collabService = new CollabService()
  ctx.inject(collabServiceCtx, collabService).record(CollabReady)
  return async () => {
    await ctx.wait(EditorViewReady)
    collabService.bindCtx(ctx)
    ctx.done(CollabReady)
    return () => {
      ctx.remove(collabServiceCtx).clearTimer(CollabReady)
    }
  }
}

export * from 'y-prosemirror'
export { CollabService } from './collab-service'

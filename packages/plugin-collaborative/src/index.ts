/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import { EditorViewReady } from '@milkdown/core'

import { CollabService } from './collab-service'

/// A slice that contains the collab service.
export const collabServiceCtx = createSlice(new CollabService(), 'collabServiceCtx')

/// The timer that indicates the collab plugin is ready.
export const CollabReady = createTimer('CollabReady')

/// The collaborative plugin.
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

export * from './collab-service'

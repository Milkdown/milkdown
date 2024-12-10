import type { MilkdownPlugin } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import { EditorViewReady } from '@milkdown/core'

import { CollabService } from './collab-service'

/// A slice that contains the collab service.
export const collabServiceCtx = createSlice(
  new CollabService(),
  'collabServiceCtx'
)

/// The timer that indicates the collab plugin is ready.
export const CollabReady = createTimer('CollabReady')

/// The collab plugin.
export const collab: MilkdownPlugin = (ctx) => {
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
collab.meta = {
  package: '@milkdown/plugin-collab',
  displayName: 'Collab',
}

export * from './collab-service'

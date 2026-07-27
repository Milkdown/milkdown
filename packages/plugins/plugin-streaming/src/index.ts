import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  abortStreamingCmd,
  endStreamingCmd,
  pushChunkCmd,
  startStreamingCmd,
} from './streaming-commands'
import { streamingConfig } from './streaming-config'
import { streamingPlugin } from './streaming-plugin'

export * from './types'
export { defaultInsertStrategy } from './flush'
export { streamingConfig } from './streaming-config'
export {
  applyStreamingAction,
  streamingPlugin,
  streamingPluginKey,
} from './streaming-plugin'
export {
  abortStreamingCmd,
  endStreamingCmd,
  pushChunkCmd,
  startStreamingCmd,
} from './streaming-commands'

/// The milkdown streaming plugin.
export const streaming: MilkdownPlugin[] = [
  streamingConfig,
  streamingPlugin,
  startStreamingCmd,
  pushChunkCmd,
  endStreamingCmd,
  abortStreamingCmd,
]

import { Crepe, CrepeFeature } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'
import { callCommand } from '@milkdown/utils'

import { setup } from '../utils'

// Command names match the string IDs registered by $command() in plugin-streaming.
// Using strings here because @milkdown/kit is not a direct dependency of e2e.
setup(async () => {
  const crepe = new Crepe({
    root: '#app',
    features: {
      [CrepeFeature.Streaming]: true,
    },
  })
  globalThis.__crepe__ = crepe
  await crepe.create()

  globalThis.__startStreaming__ = () =>
    crepe.editor.action(callCommand('StartStreaming'))
  globalThis.__pushChunk__ = (token: string) =>
    crepe.editor.action(callCommand('PushChunk', token))
  globalThis.__endStreaming__ = (options?: { diffReview?: boolean }) =>
    crepe.editor.action(callCommand('EndStreaming', options))
  globalThis.__abortStreaming__ = (options?: { keep?: boolean }) =>
    crepe.editor.action(callCommand('AbortStreaming', options))

  return crepe.editor
}).catch(console.error)

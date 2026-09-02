import { Crepe, CrepeFeature } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'
import { callCommand } from '@milkdown/utils'

import { setup } from '../utils'

// The command names match the string ids that `$command()` registers in
// plugin-streaming. A string works here because @milkdown/kit is no
// direct dependency of e2e.
setup(async () => {
  const crepe = new Crepe({
    root: '#app',
    features: {
      [CrepeFeature.AI]: true,
    },
  })
  globalThis.__crepe__ = crepe
  await crepe.create()

  globalThis.__startStreaming__ = (options?: {
    insertAt?: 'cursor' | 'selection' | number
  }) => crepe.editor.action(callCommand('StartStreaming', options))
  globalThis.__pushChunk__ = (token: string) =>
    crepe.editor.action(callCommand('PushChunk', token))
  globalThis.__endStreaming__ = (options?: { diffReview?: boolean }) =>
    crepe.editor.action(callCommand('EndStreaming', options))
  globalThis.__abortStreaming__ = (options?: { keep?: boolean }) =>
    crepe.editor.action(callCommand('AbortStreaming', options))

  return crepe.editor
}).catch(console.error)

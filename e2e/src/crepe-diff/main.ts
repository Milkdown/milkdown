import { Crepe, CrepeFeature } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'
import { callCommand } from '@milkdown/utils'

import { setup } from '../utils'

// Command names match the string IDs registered by $command() in plugin-diff.
// Using strings here because @milkdown/kit is not a direct dependency of e2e.
setup(async () => {
  const crepe = new Crepe({
    root: '#app',
    features: {
      [CrepeFeature.AI]: true,
    },
  })
  globalThis.__crepe__ = crepe
  await crepe.create()

  globalThis.__applyDiff__ = (markdown: string) =>
    crepe.editor.action(callCommand('StartDiffReview', markdown))
  globalThis.__acceptAll__ = () =>
    crepe.editor.action(callCommand('AcceptAllDiffs'))
  globalThis.__clearDiff__ = () =>
    crepe.editor.action(callCommand('ClearDiffReview'))
  globalThis.__acceptChunk__ = (index: number) =>
    crepe.editor.action(callCommand('AcceptDiffChunk', index))
  globalThis.__rejectChunk__ = (index: number) =>
    crepe.editor.action(callCommand('RejectDiffChunk', index))

  return crepe.editor
}).catch(console.error)

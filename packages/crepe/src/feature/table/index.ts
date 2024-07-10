import { tableBlock } from '@milkdown/components'
import type { DefineFeature } from '../shared'

export const defineFeature: DefineFeature = (editor) => {
  editor.use(tableBlock)
}

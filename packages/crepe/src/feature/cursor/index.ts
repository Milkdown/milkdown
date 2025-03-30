import { cursor, dropCursorConfig } from '@milkdown/kit/plugin/cursor'
import { createVirtualCursor } from 'prosemirror-virtual-cursor'

import type { DefineFeature } from '../shared'
import { $prose } from '@milkdown/kit/utils'

interface CursorConfig {
  color: string | false
  width: number
  virtual: boolean
}
export type CursorFeatureConfig = Partial<CursorConfig>

export const defineFeature: DefineFeature<CursorFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config((ctx) => {
      ctx.update(dropCursorConfig.key, () => ({
        class: 'crepe-drop-cursor',
        width: config?.width ?? 4,
        color: config?.color ?? false,
      }))
    })
    .use(cursor)

  if (config?.virtual === false) {
    return
  }

  const virtualCursor = createVirtualCursor()
  editor.use($prose(() => virtualCursor))
}

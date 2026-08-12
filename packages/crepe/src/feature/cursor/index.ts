import {
  cursor as cursorPlugin,
  dropIndicatorConfig,
} from '@milkdown/kit/plugin/cursor'
import { $prose } from '@milkdown/kit/utils'
import { createVirtualCursor } from 'prosemirror-virtual-cursor'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../index'

interface CursorConfig {
  color: string | false
  width: number
  virtual: boolean
}
export type CursorFeatureConfig = Partial<CursorConfig>

export const cursor: DefineFeature<CursorFeatureConfig> = (editor, config) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Cursor))
    .config((ctx) => {
      ctx.update(dropIndicatorConfig.key, () => ({
        class: 'crepe-drop-cursor',
        width: config?.width ?? 4,
        color: config?.color ?? false,
      }))
    })
    .use(cursorPlugin)

  if (config?.virtual === false) {
    return
  }

  // `inlineCode` is deliberately not inclusive, so that typing at the end of a
  // code span leaves it. The virtual cursor handles that boundary rather than
  // being broken by it: it renders which side the caret is on, and the arrow
  // keys move between the two. So its warning about the mark does not apply.
  const virtualCursor = createVirtualCursor({ skipWarning: ['inlineCode'] })
  editor.use($prose(() => virtualCursor))
}

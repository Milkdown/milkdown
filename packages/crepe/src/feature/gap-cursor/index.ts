import { cursor, dropCursorConfig } from '@milkdown/plugin-cursor'
import gapCursor from '@milkdown/prose/gapcursor/style/gapcurosr.css?inline'

import type { DefineFeature } from '../shared'
import { CrepeTheme } from '../../theme'
import { ThemeCtx, injectStyle } from '../../core/slice'

function getColorFromTheme(theme: CrepeTheme) {
  switch (theme) {
    case CrepeTheme.Classic:
      return '#1F1B16'
    case CrepeTheme.ClassicDark:
      return '#EAE1D9'
    default:
      return undefined
  }
}

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(injectStyle(gapCursor))
    .config((ctx) => {
      const theme = ctx.get(ThemeCtx)
      ctx.update(dropCursorConfig.key, value => ({
        ...value,
        color: getColorFromTheme(theme),
      }))
    })
    .use(cursor)
}

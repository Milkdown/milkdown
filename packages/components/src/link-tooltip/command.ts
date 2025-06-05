import { linkSchema } from '@milkdown/preset-commonmark'
import { $command } from '@milkdown/utils'

import { linkTooltipAPI } from './slices'

export const toggleLinkCommand = $command('ToggleLink', (ctx) => {
  return () => (state) => {
    const { doc, selection } = state
    const mark = linkSchema.type(ctx)
    const hasLink = doc.rangeHasMark(selection.from, selection.to, mark)
    if (hasLink) {
      ctx.get(linkTooltipAPI.key).removeLink(selection.from, selection.to)
      return true
    }

    ctx.get(linkTooltipAPI.key).addLink(selection.from, selection.to)
    return true
  }
})

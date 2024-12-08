import type { Meta, StoryObj } from '@storybook/html'
import { editorViewCtx } from '@milkdown/kit/core'
import { linkSchema } from '@milkdown/kit/preset/commonmark'
import {
  configureLinkTooltip,
  linkTooltipAPI,
  linkTooltipPlugin,
  linkTooltipState,
} from '@milkdown/kit/component/link-tooltip'
import { TooltipProvider, tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import type { Ctx } from '@milkdown/kit/ctx'
import type { EditorView } from '@milkdown/kit/prose/view'
import type { EditorState } from '@milkdown/kit/prose/state'

import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './link-tooltip.css?inline'

const meta: Meta = {
  title: 'Components/Link Tooltip',
}

export default meta

const link = `
# Link tooltip

Is this the real [life](https://en.wikipedia.org/wiki/Life)? Is this just [fantasy](https://en.wikipedia.org/wiki/fantasy)?

Caught in a [landslide](https://en.wikipedia.org/wiki/landslide), no escape from [reality](https://en.wikipedia.org/wiki/reality).
`

export const Default: StoryObj<CommonArgs> = {
  render: (args) => {
    const insertLinkTooltip = tooltipFactory('CREATE_LINK')

    function tooltipPluginView(ctx: Ctx) {
      return (_view: EditorView) => {
        const content = document.createElement('div')
        const provider = new TooltipProvider({
          content,
          shouldShow: (view: EditorView) => {
            const { selection, doc } = view.state
            const has = doc.rangeHasMark(
              selection.from,
              selection.to,
              linkSchema.type(ctx)
            )
            if (has || selection.empty) return false

            return true
          },
        })

        content.textContent = '🔗'
        content.className = 'link-insert-button'
        content.onmousedown = (e: MouseEvent) => {
          e.preventDefault()
          const view = ctx.get(editorViewCtx)
          const { selection } = view.state
          ctx.get(linkTooltipAPI.key).addLink(selection.from, selection.to)
          provider.hide()
        }

        return {
          update: (updatedView: EditorView, prevState: EditorState) => {
            if (ctx.get(linkTooltipState.key).mode === 'edit') return
            provider.update(updatedView, prevState)
          },
          destroy: () => {
            provider.destroy()
            content.remove()
          },
        }
      }
    }

    return setupMilkdown([style], args, (editor) => {
      editor
        .config((ctx) => {
          ctx.set(insertLinkTooltip.key, {
            view: tooltipPluginView(ctx),
          })
          configureLinkTooltip(ctx)
        })
        .use(linkTooltipPlugin)
        .use(insertLinkTooltip)
    })
  },
  args: {
    readonly: false,
    defaultValue: link,
  },
}

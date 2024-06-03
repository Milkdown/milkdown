import type { Meta, StoryObj } from '@storybook/html'
import { Editor, defaultValueCtx, editorViewCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark, linkSchema } from '@milkdown/preset-commonmark'
import { history } from '@milkdown/plugin-history'
import {
  configureLinkTooltip,
  linkTooltipAPI,
  linkTooltipPlugin,
  linkTooltipState,
} from '@milkdown/components/link-tooltip'
import { TooltipProvider, tooltipFactory } from '@milkdown/plugin-tooltip'
import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import type { EditorState } from '@milkdown/prose/state'

import './link-tooltip.css'

const meta: Meta = {
  title: 'Components/Link Tooltip',
}

export default meta

interface Args {
  readonly: boolean
  defaultValue: string
}

const link = `
# Link tooltip

Is this the real [life](https://en.wikipedia.org/wiki/Life)? Is this just [fantasy](https://en.wikipedia.org/wiki/fantasy)?

Caught in a [landslide](https://en.wikipedia.org/wiki/landslide), no escape from [reality](https://en.wikipedia.org/wiki/reality).
`

export const Default: StoryObj<Args> = {
  render: (args) => {
    const root = document.createElement('div')
    root.classList.add('milkdown-storybook')
    const insertLinkTooltip = tooltipFactory('CREATE_LINK')

    function tooltipPluginView(ctx: Ctx) {
      return (_view: EditorView) => {
        const content = document.createElement('div')
        const provider = new TooltipProvider({
          content,
          shouldShow: (view: EditorView) => {
            const { selection, doc } = view.state
            const has = doc.rangeHasMark(selection.from, selection.to, linkSchema.type(ctx))
            if (has || selection.empty)
              return false

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
            if (ctx.get(linkTooltipState.key).mode === 'edit')
              return
            provider.update(updatedView, prevState)
          },
          destroy: () => {
            provider.destroy()
            content.remove()
          },
        }
      }
    }
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, args.defaultValue)
        ctx.set(editorViewOptionsCtx, {
          editable: () => !args.readonly,
        })
        ctx.set(insertLinkTooltip.key, {
          view: tooltipPluginView(ctx),
        })
        configureLinkTooltip(ctx)
      })
      .config(nord)
      .use(commonmark)
      .use(linkTooltipPlugin)
      .use(insertLinkTooltip)
      .use(history)
      .create()

    return root
  },
  args: {
    readonly: false,
    defaultValue: link,
  },
}

/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, editorViewCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark, linkSchema } from '@milkdown/preset-commonmark'
import {
  configureLinkTooltip,
  linkTooltipAPI,
  linkTooltipPlugin,
  linkTooltipState,
} from '@milkdown/components/link-tooltip'
import { TooltipProvider, tooltipFactory } from '@milkdown/plugin-tooltip'
import type { EditorState } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'

import type { Ctx } from '@milkdown/ctx'
import { setup } from '../utils'

import '@milkdown/theme-nord/style.css'

import '../style.css'

import './style.css'

const markdown = `
# Link tooltip

Is this the real [life](https://en.wikipedia.org/wiki/Life)? Is this just [fantasy](https://en.wikipedia.org/wiki/fantasy)?

Caught in a [landslide](https://en.wikipedia.org/wiki/landslide), no escape from [reality](https://en.wikipedia.org/wiki/reality).
`

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

setup(() => {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.getElementById('app'))
      ctx.set(defaultValueCtx, markdown)
      ctx.set(insertLinkTooltip.key, {
        view: tooltipPluginView(ctx),
      })
      configureLinkTooltip(ctx)
    })
    .config(nord)
    .use(commonmark)
    .use(linkTooltipPlugin)
    .use(insertLinkTooltip)
    .create()
})

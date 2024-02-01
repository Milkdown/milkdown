/* Copyright 2021, Milkdown by Mirone. */
import { TooltipProvider, tooltipFactory } from '@milkdown/plugin-tooltip'
import type { EditorState, PluginView } from '@milkdown/prose/state'
import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import type { AtomicoThis } from 'atomico/types/dom'
import type { DefineFeature } from '../shared'
import { injectStyle } from '../../core/slice'
import type { ToolbarProps } from './component'
import { ToolbarElement } from './component'
import style from './style.css?inline'

const toolbar = tooltipFactory('CREPE_TOOLBAR')

class ToolbarView implements PluginView {
  #tooltipProvider: TooltipProvider
  #content: AtomicoThis<ToolbarProps>
  constructor(ctx: Ctx, view: EditorView) {
    this.#content = new ToolbarElement()
    this.#content.ctx = ctx
    this.#content.hide = this.hide

    this.#tooltipProvider = new TooltipProvider({
      content: this.#content,
      debounce: 20,
      tippyOptions: {
        arrow: false,
        delay: 0,
        duration: 0,
        onShow: () => {
          this.#content.show = true
        },
        onHidden: () => {
          this.#content.show = false
        },
      },
    })
    this.update(view)
  }

  update = (view: EditorView, prevState?: EditorState) => {
    this.#tooltipProvider.update(view, prevState)
  }

  destroy = () => {
    this.#tooltipProvider.destroy()
    this.#content.remove()
  }

  hide = () => {
    this.#tooltipProvider.hide()
  }
}

export const defineFeature: DefineFeature = (editor) => {
  customElements.define('milkdown-toolbar', ToolbarElement)
  editor
    .config(injectStyle(style))
    .config((ctx) => {
      ctx.set(toolbar.key, {
        view: view => new ToolbarView(ctx, view),
      })
    })
    .use(toolbar)
}

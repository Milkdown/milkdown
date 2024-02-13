/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { TextSelection } from '@milkdown/prose/state'
import type { PluginView } from '@milkdown/prose/state'
import type { Mark } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'
import { TooltipProvider } from '@milkdown/plugin-tooltip'
import { editorViewCtx, rootDOMCtx } from '@milkdown/core'
import { posToDOMRect } from '@milkdown/prose'
import { linkSchema } from '@milkdown/preset-commonmark'
import { linkTooltipConfig, linkTooltipState } from '../slices'
import { LinkEditElement } from './edit-component'

interface Data {
  from: number
  to: number
  mark: Mark | null
}

const defaultData: Data = {
  from: -1,
  to: -1,
  mark: null,
}

export class LinkEditTooltip implements PluginView {
  #content = new LinkEditElement()
  #provider: TooltipProvider
  #data: Data = { ...defaultData }

  constructor(readonly ctx: Ctx, view: EditorView) {
    this.#provider = new TooltipProvider({
      content: this.#content,
      debounce: 0,
      shouldShow: () => false,
      tippyOptions: {
        appendTo: () => ctx.get(rootDOMCtx),
        onHidden: () => {
          this.#content.update().catch((e) => {
            throw e
          })
          ctx.get(editorViewCtx).dom.focus()
        },
      },
    })
    this.#provider.update(view)
    this.#content.onConfirm = this.#confirmEdit
    this.#content.onCancel = this.#reset
  }

  #reset = () => {
    this.#provider.hide()
    this.ctx.update(linkTooltipState.key, state => ({
      ...state,
      mode: 'preview' as const,
    }))
    this.#data = { ...defaultData }
  }

  #setRect = (rect: DOMRect) => {
    this.#provider.getInstance()?.setProps({
      getReferenceClientRect: () => rect,
    })
  }

  #confirmEdit = (href: string) => {
    const view = this.ctx.get(editorViewCtx)
    const { from, to, mark } = this.#data
    const type = linkSchema.type(this.ctx)
    if (mark && mark.attrs.href === href) {
      this.#reset()
      return
    }

    const tr = view.state.tr
    if (mark)
      tr.removeMark(from, to, mark)

    tr.addMark(from, to, type.create({ href }))
    view.dispatch(tr)

    this.#reset()
  }

  #enterEditMode = (value: string, from: number, to: number) => {
    const config = this.ctx.get(linkTooltipConfig.key)
    this.#content.config = config
    this.#content.src = value
    this.ctx.update(linkTooltipState.key, state => ({
      ...state,
      mode: 'edit' as const,
    }))
    const view = this.ctx.get(editorViewCtx)
    this.#setRect(posToDOMRect(view, from, to))
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to)))
    this.#provider.show()
    requestAnimationFrame(() => {
      this.#content.querySelector('input')?.focus()
    })
  }

  update = (view: EditorView) => {
    const { state } = view
    const { selection } = state
    const { from, to } = selection
    if (from === this.#data.from && to === this.#data.to)
      return

    this.#reset()
  }

  destroy = () => {
    this.#provider.destroy()
    this.#content.remove()
  }

  addLink = (from: number, to: number) => {
    this.#data = {
      from,
      to,
      mark: null,
    }
    this.#enterEditMode('', from, to)
  }

  editLink = (mark: Mark, from: number, to: number) => {
    this.#data = {
      from,
      to,
      mark,
    }
    this.#enterEditMode(mark.attrs.href, from, to)
  }

  removeLink = (from: number, to: number) => {
    const view = this.ctx.get(editorViewCtx)

    const tr = view.state.tr
    tr.removeMark(from, to, linkSchema.type(this.ctx))
    view.dispatch(tr)

    this.#reset()
  }
}

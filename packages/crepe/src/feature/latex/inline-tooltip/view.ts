import type { Ctx } from '@milkdown/kit/ctx'
import type { PluginView } from '@milkdown/kit/prose/state'

import { TooltipProvider } from '@milkdown/kit/plugin/tooltip'
import { redo, undo } from '@milkdown/kit/prose/history'
import { keymap } from '@milkdown/kit/prose/keymap'
import { Schema } from '@milkdown/kit/prose/model'
import { EditorState, NodeSelection } from '@milkdown/kit/prose/state'
import { EditorView } from '@milkdown/kit/prose/view'
import { createApp, shallowRef, type App, type ShallowRef } from 'vue'

import type { LatexConfig } from '..'

import { mathInlineId } from '../inline-latex'
import { LatexTooltip } from './component'

export class LatexInlineTooltip implements PluginView {
  #content: HTMLElement
  #provider: TooltipProvider
  #dom: HTMLElement
  #innerView: ShallowRef<EditorView | null> = shallowRef(null)
  #updateValue: ShallowRef<() => void> = shallowRef(() => {})
  #app: App

  constructor(
    readonly ctx: Ctx,
    view: EditorView,
    config: Partial<LatexConfig>
  ) {
    const content = document.createElement('div')
    content.className = 'milkdown-latex-inline-edit'
    this.#content = content
    this.#app = createApp(LatexTooltip, {
      config,
      innerView: this.#innerView,
      updateValue: this.#updateValue,
    })
    this.#app.mount(content)
    this.#provider = new TooltipProvider({
      debounce: 0,
      content: this.#content,
      shouldShow: this.#shouldShow,
      offset: 10,
      floatingUIOptions: {
        placement: 'bottom',
      },
    })
    this.#provider.update(view)
    this.#dom = document.createElement('div')
  }

  #onHide = () => {
    if (this.#innerView.value) {
      this.#innerView.value.destroy()
      this.#innerView.value = null
    }
  }

  #shouldShow = (view: EditorView) => {
    const shouldShow = () => {
      const { selection, schema } = view.state
      if (selection.empty) return false
      if (!(selection instanceof NodeSelection)) return false
      const node = selection.node
      if (node.type.name !== mathInlineId) return false

      const textFrom = selection.from

      const paragraph = schema.nodes.paragraph!.create(
        null,
        schema.text(node.attrs.value)
      )

      const innerView = new EditorView(this.#dom, {
        state: EditorState.create({
          doc: paragraph,
          schema: new Schema({
            nodes: {
              doc: {
                content: 'block+',
              },
              paragraph: {
                content: 'inline*',
                group: 'block',
                parseDOM: [{ tag: 'p' }],
                toDOM() {
                  return ['p', 0]
                },
              },
              text: {
                group: 'inline',
              },
            },
          }),
          plugins: [
            keymap({
              'Mod-z': undo,
              'Mod-Z': redo,
              'Mod-y': redo,
              Enter: () => {
                this.#updateValue.value()
                return true
              },
            }),
          ],
        }),
      })

      this.#innerView.value = innerView
      this.#updateValue.value = () => {
        const { tr } = view.state
        tr.setNodeAttribute(textFrom, 'value', innerView.state.doc.textContent)
        view.dispatch(tr)
        requestAnimationFrame(() => {
          view.focus()
        })
      }
      return true
    }

    const show = shouldShow()
    if (!show) this.#onHide()
    return show
  }

  update = (view: EditorView, prevState?: EditorState) => {
    this.#provider.update(view, prevState)
  }

  destroy = () => {
    this.#app.unmount()
    this.#provider.destroy()
    this.#content.remove()
  }
}

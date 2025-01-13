import type { Ctx } from '@milkdown/kit/ctx'
import { TooltipProvider } from '@milkdown/kit/plugin/tooltip'
import type { PluginView } from '@milkdown/kit/prose/state'
import { EditorState, NodeSelection } from '@milkdown/kit/prose/state'
import { EditorView } from '@milkdown/kit/prose/view'
import { mathInlineId } from '../inline-latex'
import { LatexInlineEditElement } from './component'
import type { LatexConfig } from '..'
import { keymap } from '@milkdown/kit/prose/keymap'
import { redo, undo } from '@milkdown/kit/prose/history'
import { Schema } from '@milkdown/kit/prose/model'

export class LatexInlineTooltip implements PluginView {
  #content = new LatexInlineEditElement()
  #provider: TooltipProvider
  #dom: HTMLElement
  #innerView: EditorView | null

  constructor(
    readonly ctx: Ctx,
    view: EditorView,
    config: Partial<LatexConfig>
  ) {
    this.#provider = new TooltipProvider({
      debounce: 0,
      content: this.#content,
      shouldShow: this.#shouldShow,
      offset: 10,
      floatingUIOptions: {
        placement: 'bottom',
      },
    })
    this.#content.config = config
    this.#provider.update(view)
    this.#dom = document.createElement('div')
    this.#innerView = null
  }

  #onHide = () => {
    if (this.#innerView) {
      this.#innerView.destroy()
      this.#innerView = null
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
                this.#content.updateValue?.()
                return true
              },
            }),
          ],
        }),
      })

      this.#innerView = innerView
      this.#content.innerView = this.#innerView
      this.#content.updateValue = () => {
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
    this.#provider.destroy()
    this.#content.remove()
  }
}

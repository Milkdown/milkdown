/* Copyright 2021, Milkdown by Mirone. */
import type { ThemeInputChipType } from '@milkdown/core'
import { commandsCtx, createCmd, createCmdKey } from '@milkdown/core'
import { expectDomTypeError, missingRootElement } from '@milkdown/exception'
import { calculateTextPosition } from '@milkdown/prose'
import { toggleMark } from '@milkdown/prose/commands'
import type { Node as ProseNode } from '@milkdown/prose/model'
import { NodeSelection, Plugin, PluginKey, TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { createMark } from '@milkdown/utils'

const key = new PluginKey('MILKDOWN_LINK_INPUT')

export const ToggleLink = createCmdKey<string>('ToggleLink')
export const ModifyLink = createCmdKey<string>('ModifyLink')
const id = 'link'
export interface LinkOptions {
  input: {
    placeholder?: string
    buttonText?: string
    displayWhenSelected?: boolean
  }
}
export const link = createMark<string, LinkOptions>((utils, options) => {
  return {
    id,
    schema: () => ({
      attrs: {
        href: {},
        title: { default: null },
      },
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement))
              throw expectDomTypeError(dom)

            return { href: dom.getAttribute('href'), title: dom.getAttribute('title') }
          },
        },
      ],
      toDOM: mark => ['a', { ...mark.attrs, class: utils.getClassName(mark.attrs, id) }],
      parseMarkdown: {
        match: node => node.type === 'link',
        runner: (state, node, markType) => {
          const url = node.url as string
          const title = node.title as string
          state.openMark(markType, { href: url, title })
          state.next(node.children)
          state.closeMark(markType)
        },
      },
      toMarkdown: {
        match: mark => mark.type.name === id,
        runner: (state, mark) => {
          state.withMark(mark, 'link', undefined, {
            title: mark.attrs.title,
            url: mark.attrs.href,
          })
        },
      },
    }),
    commands: markType => [
      createCmd(ToggleLink, (href = '') => toggleMark(markType, { href })),
      createCmd(ModifyLink, (href = '') => (state, dispatch) => {
        if (!dispatch)
          return false

        const { marks } = state.schema

        let node: ProseNode | undefined
        let pos = -1
        const { selection } = state
        const { from, to } = selection
        state.doc.nodesBetween(from, from === to ? to + 1 : to, (n, p) => {
          if (marks.link?.isInSet(n.marks)) {
            node = n
            pos = p
            return false
          }

          return undefined
        })
        if (!node)
          return false

        const mark = node.marks.find(({ type }) => type === markType)
        if (!mark)
          return false

        const start = pos
        const end = pos + node.nodeSize
        const { tr } = state
        const linkMark = marks.link?.create({ ...mark.attrs, href })
        if (!linkMark)
          return false
        dispatch(
          tr
            .removeMark(start, end, mark)
            .addMark(start, end, linkMark)
            .setSelection(new TextSelection(tr.selection.$anchor))
            .scrollIntoView(),
        )

        return true
      }),
    ],
    prosePlugins: (type, ctx) => {
      let renderOnTop = false
      return [
        new Plugin({
          key,
          view: (editorView) => {
            const inputChipRenderer = utils.themeManager.get<ThemeInputChipType>('input-chip', {
              placeholder: options?.input?.placeholder ?? 'Input Web Link',
              buttonText: options?.input?.buttonText,
              onUpdate: (value) => {
                ctx.get(commandsCtx).call(ModifyLink, value)
              },
              calculatePosition: (view, input) => {
                calculateTextPosition(view, input, (start, end, target, parent) => {
                  const $editor = view.dom.parentElement
                  if (!$editor)
                    throw missingRootElement()

                  const selectionWidth = end.left - start.left
                  let left = start.left - parent.left - (target.width - selectionWidth) / 2
                  let top = start.bottom - parent.top + 14 + $editor.scrollTop

                  if (renderOnTop)
                    top = start.top - parent.top - target.height - 14 + $editor.scrollTop

                  if (left < 0)
                    left = 0

                  const maxLeft = $editor.clientWidth - (target.width + 4)
                  if (left > maxLeft)
                    left = maxLeft

                  return [top, left]
                })
              },
            })
            if (!inputChipRenderer)
              return {}
            const shouldDisplay = (view: EditorView) => {
              const { selection, doc } = view.state
              const { from, to } = selection

              if (!view.hasFocus())
                return false

              if (
                selection instanceof TextSelection
                                && to < doc.content.size
                                && from < doc.content.size
                                && doc.rangeHasMark(from, from === to ? to + 1 : to, type)
              ) {
                let shouldDisplay = selection.empty
                if (options?.input?.displayWhenSelected && !shouldDisplay) {
                  doc.nodesBetween(from, from === to ? to + 1 : to, (node, pos) => {
                    if (
                      node.marks.some(
                        mark =>
                          mark.type === type && from >= pos && to <= pos + node.nodeSize,
                      )
                    ) {
                      shouldDisplay = true
                      return false
                    }

                    return undefined
                  })
                }
                if (shouldDisplay) {
                  renderOnTop = false
                  return true
                }
              }

              if (selection instanceof NodeSelection) {
                const { node } = selection
                if (
                  node.type.name === 'image'
                                    && node.marks.findIndex(mark => mark.type.name === id) > -1
                ) {
                  renderOnTop = true
                  return true
                }
              }

              return false
            }
            const getCurrentLink = (view: EditorView) => {
              const { selection } = view.state
              let node: ProseNode | undefined
              const { from, to } = selection
              view.state.doc.nodesBetween(from, from === to ? to + 1 : to, (n) => {
                if (type.isInSet(n.marks)) {
                  node = n
                  return false
                }

                return undefined
              })
              if (!node)
                return

              const mark = node.marks.find(m => m.type === type)
              if (!mark)
                return

              const value = mark.attrs.href
              return value
            }
            const renderByView = (view: EditorView) => {
              if (!view.editable)
                return

              const display = shouldDisplay(view)
              if (display) {
                inputChipRenderer.show(view)
                inputChipRenderer.update(getCurrentLink(view))
              }
              else {
                inputChipRenderer.hide()
              }
            }
            inputChipRenderer.init(editorView)
            renderByView(editorView)

            return {
              update: (view, prevState) => {
                const isEqualSelection
                                    = prevState?.doc.eq(view.state.doc) && prevState.selection.eq(view.state.selection)
                if (isEqualSelection)
                  return

                requestAnimationFrame(() => {
                  renderByView(view)
                })
              },
              destroy: () => {
                inputChipRenderer.destroy()
              },
            }
          },
        }),
      ]
    },
  }
})

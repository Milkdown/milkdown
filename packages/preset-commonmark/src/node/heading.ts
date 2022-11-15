/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { createCmd, createCmdKey, editorViewCtx, getPalette, schemaCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { cloneTr } from '@milkdown/prose'
import { setBlockType } from '@milkdown/prose/commands'
import { textblockTypeInputRule } from '@milkdown/prose/inputrules'
import type { Node, NodeType } from '@milkdown/prose/model'
import { Fragment } from '@milkdown/prose/model'
import type { EditorState, Transaction } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { Decoration, DecorationSet } from '@milkdown/prose/view'
import type { ThemeUtils } from '@milkdown/utils'
import { createNode, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

const headingIndex = Array(6)
  .fill(0)
  .map((_, i) => i + 1)

type Keys =
    | SupportedKeys['H1']
    | SupportedKeys['H2']
    | SupportedKeys['H3']
    | SupportedKeys['H4']
    | SupportedKeys['H5']
    | SupportedKeys['H6']
    | SupportedKeys['DowngradeHeading']

export const TurnIntoHeading = createCmdKey<number>('TurnIntoHeading')
export const DowngradeHeading = createCmdKey('DowngradeHeading')

export const headingIdPluginKey = new PluginKey('MILKDOWN_HEADING_ID')
export const headingHashPluginKey = new PluginKey('MILKDOWN_HEADING_HASH')

const createId = (node: Node) =>
  node.textContent
    .replace(/[\p{P}\p{S}]/gu, '')
    .replace(/\s/g, '-')
    .toLowerCase()
    .trim()

const headingIdPlugin = (ctx: Ctx, type: NodeType, getId: (node: Node) => string): Plugin => {
  let lock = false
  const walkThrough = (state: EditorState, callback: (tr: Transaction) => void) => {
    const tr = state.tr.setMeta('addToHistory', false)
    let found = false
    state.doc.descendants((node, pos) => {
      if (node.type === type && !lock) {
        if (node.textContent.trim().length === 0)
          return

        const attrs = node.attrs
        const id = getId(node)

        if (attrs.id !== id) {
          found = true
          tr.setMeta(headingIdPluginKey, true).setNodeMarkup(pos, undefined, {
            ...attrs,
            id,
          })
        }
      }
    })
    if (found)
      callback(tr)
  }
  return new Plugin({
    key: headingIdPluginKey,
    props: {
      handleDOMEvents: {
        compositionstart: () => {
          lock = true
          return false
        },
        compositionend: () => {
          lock = false
          const view = ctx.get(editorViewCtx)
          setTimeout(() => {
            walkThrough(view.state, tr => view.dispatch(tr))
          }, 0)
          return false
        },
      },
    },
    appendTransaction: (transactions, _, nextState) => {
      let tr: Transaction | null = null

      if (
        transactions.every(transaction => !transaction.getMeta(headingIdPluginKey))
                && transactions.some(transaction => transaction.docChanged)
      ) {
        walkThrough(nextState, (t) => {
          tr = t
        })
      }

      return tr
    },
    view: (view) => {
      const doc = view.state.doc
      let tr = view.state.tr.setMeta('addToHistory', false)
      doc.descendants((node, pos) => {
        if (node.type.name === 'heading' && node.attrs.level) {
          if (!node.attrs.id) {
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              id: getId(node),
            })
          }
        }
      })
      view.dispatch(tr)
      return {}
    },
  })
}

const headingHashPlugin = (ctx: Ctx, type: NodeType, utils: ThemeUtils): Plugin => {
  return new Plugin({
    key: headingHashPluginKey,
    state: {
      init: () => {
        return DecorationSet.empty
      },
      apply: (tr) => {
        const view = ctx.get(editorViewCtx)
        if (!view.hasFocus?.() || !view.editable)
          return DecorationSet.empty

        const { $from } = tr.selection
        const node = $from.node()
        if (node.type !== type)
          return DecorationSet.empty

        const level = node.attrs.level
        const getHashes = (level: number) => {
          return Array(level)
            .fill(0)
            .map(_ => '#')
            .join('')
        }
        const widget = document.createElement('span')
        widget.textContent = getHashes(level)
        widget.contentEditable = 'false'
        utils.themeManager.onFlush(() => {
          const style = utils.getStyle(({ css }) => {
            const palette = getPalette(utils.themeManager)
            return css`
                            margin-right: 4px;
                            color: ${palette('primary')};
                        `
          })
          if (style)
            widget.className = style
        })

        const deco = Decoration.widget($from.before() + 1, widget, { side: -1 })
        return DecorationSet.create(tr.doc, [deco])
      },
    },
    props: {
      handleDOMEvents: {
        focus: (view) => {
          const tr = cloneTr(view.state.tr)
          view.dispatch(tr)
          return false
        },
      },
      decorations(this: Plugin, state) {
        return this.getState(state)
      },
    },
  })
}

export const heading = createNode<Keys, { getId: (node: Node) => string; displayHashtag: boolean }>(
  (utils, options) => {
    const id = 'heading'

    const getId = options?.getId ?? createId
    const displayHashtag = options?.displayHashtag ?? true

    return {
      id,
      schema: () => ({
        content: 'inline*',
        group: 'block',
        defining: true,
        attrs: {
          id: {
            default: '',
          },
          level: {
            default: 1,
          },
        },
        parseDOM: headingIndex.map(x => ({
          tag: `h${x}`,
          getAttrs: (node) => {
            if (!(node instanceof HTMLElement))
              throw expectDomTypeError(node)

            return { level: x, id: node.id }
          },
        })),
        toDOM: (node) => {
          return [
                        `h${node.attrs.level}`,
                        {
                          id: node.attrs.id || getId(node),
                          class: utils.getClassName(node.attrs, `heading h${node.attrs.level}`),
                        },
                        0,
          ]
        },
        parseMarkdown: {
          match: ({ type }) => type === id,
          runner: (state, node, type) => {
            const depth = node.depth as number
            state.openNode(type, { level: depth })
            state.next(node.children)
            state.closeNode()
          },
        },
        toMarkdown: {
          match: node => node.type.name === id,
          runner: (state, node) => {
            state.openNode('heading', undefined, { depth: node.attrs.level })
            const lastIsHardbreak = node.childCount >= 1 && node.lastChild?.type.name === 'hardbreak'
            if (lastIsHardbreak) {
              const contentArr: Node[] = []
              node.content.forEach((n, _, i) => {
                if (i === node.childCount - 1)
                  return

                contentArr.push(n)
              })
              state.next(Fragment.fromArray(contentArr))
            }
            else {
              state.next(node.content)
            }
            state.closeNode()
          },
        },
      }),
      inputRules: (type, ctx) =>
        headingIndex.map(x =>
          textblockTypeInputRule(new RegExp(`^(#{1,${x}})\\s$`), type, () => {
            const view = ctx.get(editorViewCtx)
            const { $from } = view.state.selection
            const node = $from.node()
            if (node.type.name === 'heading') {
              let level = Number(node.attrs.level) + Number(x)
              if (level > 6)
                level = 6

              return {
                level,
              }
            }
            return {
              level: x,
            }
          }),
        ),
      commands: (type, ctx) => [
        createCmd(TurnIntoHeading, (level = 1) => {
          if (level < 1)
            return setBlockType(level === 0 ? ctx.get(schemaCtx).nodes.paragraph || type : type)

          return setBlockType(level === 0 ? ctx.get(schemaCtx).nodes.paragraph || type : type, { level })
        }),
        createCmd(DowngradeHeading, () => {
          return (state, dispatch, view) => {
            const { $from } = state.selection
            const node = $from.node()
            if (node.type !== type || !state.selection.empty || $from.parentOffset !== 0)
              return false

            const level = node.attrs.level - 1
            if (!level)
              return setBlockType(ctx.get(schemaCtx).nodes.paragraph || type)(state, dispatch, view)

            dispatch?.(
              state.tr.setNodeMarkup(state.selection.$from.before(), undefined, {
                ...node.attrs,
                level,
              }),
            )
            return true
          }
        }),
      ],
      shortcuts: {
        [SupportedKeys.H1]: createShortcut(TurnIntoHeading, 'Mod-Alt-1', 1),
        [SupportedKeys.H2]: createShortcut(TurnIntoHeading, 'Mod-Alt-2', 2),
        [SupportedKeys.H3]: createShortcut(TurnIntoHeading, 'Mod-Alt-3', 3),
        [SupportedKeys.H4]: createShortcut(TurnIntoHeading, 'Mod-Alt-4', 4),
        [SupportedKeys.H5]: createShortcut(TurnIntoHeading, 'Mod-Alt-5', 5),
        [SupportedKeys.H6]: createShortcut(TurnIntoHeading, 'Mod-Alt-6', 6),
        [SupportedKeys.DowngradeHeading]: createShortcut(DowngradeHeading, ['Backspace', 'Delete']),
      },
      prosePlugins: (type, ctx) => {
        const plugins = [headingIdPlugin(ctx, type, getId)]
        if (displayHashtag)
          plugins.push(headingHashPlugin(ctx, type, utils))

        return plugins
      },
    }
  },
)

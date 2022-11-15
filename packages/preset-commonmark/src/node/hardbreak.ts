/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { Plugin, PluginKey, Selection } from '@milkdown/prose/state'
import { AddMarkStep, ReplaceStep } from '@milkdown/prose/transform'
import { createNode, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['HardBreak']

export const InsertHardbreak = createCmdKey('InsertHardbreak')

export const HardbreakFilterPluginKey = new PluginKey('MILKDOWN_HARDBREAK_FILTER')

export const hardbreak = createNode<
    Keys,
    {
      notIn: string[]
    }
>((utils, options) => {
  const notIn = options?.notIn ?? ['table', 'fence']
  return {
    id: 'hardbreak',
    schema: () => ({
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM: node => ['br', { class: utils.getClassName(node.attrs, 'hardbreak') }],
      parseMarkdown: {
        match: ({ type }) => type === 'break',
        runner: (state, _, type) => {
          state.addNode(type)
        },
      },
      toMarkdown: {
        match: node => node.type.name === 'hardbreak',
        runner: (state) => {
          state.addNode('break')
        },
      },
    }),
    commands: type => [
      createCmd(InsertHardbreak, () => (state, dispatch) => {
        const { selection, tr } = state
        if (selection.empty) {
          // Transform two successive hardbreak into a new line
          const node = selection.$from.node()
          if (node.childCount > 0 && node.lastChild?.type.name === 'hardbreak') {
            dispatch?.(
              tr
                .replaceRangeWith(selection.to - 1, selection.to, state.schema.node('paragraph'))
                .setSelection(Selection.near(tr.doc.resolve(selection.to)))
                .scrollIntoView(),
            )
            return true
          }
        }
        dispatch?.(tr.setMeta('hardbreak', true).replaceSelectionWith(type.create()).scrollIntoView())
        return true
      }),
    ],
    shortcuts: {
      [SupportedKeys.HardBreak]: createShortcut(InsertHardbreak, 'Shift-Enter'),
    },
    prosePlugins: type => [
      new Plugin({
        key: HardbreakFilterPluginKey,
        filterTransaction: (tr, state) => {
          const isInsertHr = tr.getMeta('hardbreak')
          const [step] = tr.steps
          if (isInsertHr && step) {
            const { from } = step as unknown as { from: number }
            const $from = state.doc.resolve(from)
            let curDepth = $from.depth
            let canApply = true
            while (curDepth > 0) {
              if (notIn.includes($from.node(curDepth).type.name))
                canApply = false

              curDepth--
            }
            return canApply
          }
          return true
        },
      }),
      new Plugin({
        key: new PluginKey('MILKDOWN_HARDBREAK_MARKS'),
        appendTransaction: (trs, _oldState, newState) => {
          if (!trs.length)
            return
          const [tr] = trs
          if (!tr)
            return

          const [step] = tr.steps

          const isInsertHr = tr.getMeta('hardbreak')
          if (isInsertHr) {
            if (!(step instanceof ReplaceStep))
              return

            const { from } = step as unknown as { from: number }
            return newState.tr.setNodeMarkup(from, type, undefined, [])
          }

          const isAddMarkStep = step instanceof AddMarkStep
          if (isAddMarkStep) {
            let _tr = newState.tr
            const { from, to } = step as unknown as { from: number; to: number }
            newState.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type === type)
                _tr = _tr.setNodeMarkup(pos, type, undefined, [])
            })

            return _tr
          }

          return undefined
        },
      }),
    ],
  }
})

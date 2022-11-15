/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import type { MarkType } from '@milkdown/prose/model'
import { createMark, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['CodeInline']
const id = 'code_inline'

export const ToggleInlineCode = createCmdKey('ToggleInlineCode')

export const codeInline = createMark<Keys>((utils) => {
  return {
    id,
    schema: () => ({
      priority: 100,
      code: true,
      inclusive: false,
      parseDOM: [{ tag: 'code' }],
      toDOM: mark => ['code', { class: utils.getClassName(mark.attrs, 'code-inline') }],
      parseMarkdown: {
        match: node => node.type === 'inlineCode',
        runner: (state, node, markType) => {
          state.openMark(markType)
          state.addText(node.value as string)
          state.closeMark(markType)
        },
      },
      toMarkdown: {
        match: mark => mark.type.name === id,
        runner: (state, mark, node) => {
          state.withMark(mark, 'inlineCode', node.text || '')
        },
      },
    }),
    commands: markType => [
      createCmd(ToggleInlineCode, () => (state, dispatch) => {
        const { selection, tr } = state
        if (selection.empty)
          return false
        const { from, to } = selection

        const has = state.doc.rangeHasMark(from, to, markType)
        if (has) {
          dispatch?.(tr.removeMark(from, to, markType))
          return true
        }

        const restMarksName = Object.keys(state.schema.marks).filter(x => x !== markType.name)

        restMarksName
          .map(name => state.schema.marks[name] as MarkType)
          .forEach((t) => {
            tr.removeMark(from, to, t)
          })

        dispatch?.(tr.addMark(from, to, markType.create()))
        return true
      }),
    ],
    shortcuts: {
      [SupportedKeys.CodeInline]: createShortcut(ToggleInlineCode, 'Mod-e'),
    },
  }
})

/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { InputRule } from '@milkdown/prose/inputrules'
import { NodeSelection } from '@milkdown/prose/state'
import { $command, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'

import { getId } from './utility'
import { remarkMermaid } from './remark-mermaid'

const id = 'diagram'
export const diagramSchema = $nodeSchema(id, () => ({
  content: 'text*',
  group: 'block',
  marks: '',
  defining: true,
  atom: true,
  code: true,
  isolating: true,
  attrs: {
    value: {
      default: '',
    },
    identity: {
      default: '',
    },
  },
  parseDOM: [
    {
      tag: `div[data-type="${id}"]`,
      preserveWhitespace: 'full',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return {
          value: dom.dataset.value,
          identity: dom.id,
        }
      },
    },
  ],
  toDOM: (node) => {
    const identity = getId(node)
    return [
      'div',
      {
        'id': identity,
        'data-type': id,
        'data-value': node.attrs.value || node.textContent || '',
      },
      0,
    ]
  },
  parseMarkdown: {
    match: ({ type }) => type === id,
    runner: (state, node, type) => {
      const value = node.value as string
      state.openNode(type, { value })
      if (value)
        state.addText(value)

      state.closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === id,
    runner: (state, node) => {
      state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: 'mermaid' })
    },
  },
}))

export const insertDiagramInputRules = $inputRule(() =>
  new InputRule(/^```mermaid$/, (state, _match, start, end) => {
    const nodeType = diagramSchema.type()
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType))
      return null
    const tr = state.tr.delete(start, end).setBlockType(start, start, nodeType, { id: getId() })

    return tr.setSelection(NodeSelection.create(tr.doc, start - 1))
  }))

export const remarkDiagramPlugin = $remark(() => remarkMermaid)

export const insertDiagramCommand = $command('InsertDiagramCommand', () => () => setBlockType(diagramSchema.type(), { id: getId() }))


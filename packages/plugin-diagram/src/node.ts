/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { InputRule } from '@milkdown/prose/inputrules'
import { $command, $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import type { MermaidConfig } from 'mermaid'
import mermaid from 'mermaid'

import { remarkMermaid } from './remark-mermaid'
import { getId } from './utility'

export const mermaidConfigCtx = $ctx<MermaidConfig, 'mermaidConfig'>({ startOnLoad: false }, 'mermaidConfig')

const id = 'diagram'
export const diagramSchema = $nodeSchema(id, (ctx) => {
  mermaid.initialize({
    ...ctx.get(mermaidConfigCtx.key),
  })
  return {
    content: 'text*',
    group: 'block',
    marks: '',
    defining: true,
    atom: true,
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
            identity: dom.dataset.id,
          }
        },
      },
    ],
    toDOM: (node) => {
      const identity = getId(node)
      const code = node.attrs.value as string

      const dom = document.createElement('div')
      dom.dataset.type = id
      dom.dataset.id = identity
      dom.dataset.value = code
      dom.textContent = code

      return dom
    },
    parseMarkdown: {
      match: ({ type }) => type === id,
      runner: (state, node, type) => {
        const value = node.value as string
        state.addNode(type, { value, identity: getId() })
      },
    },
    toMarkdown: {
      match: node => node.type.name === id,
      runner: (state, node) => {
        state.addNode('code', undefined, node.attrs.value || '', { lang: 'mermaid' })
      },
    },
  }
})

export const insertDiagramInputRules = $inputRule(() =>
  new InputRule(/^```mermaid$/, (state, _match, start, end) => {
    const nodeType = diagramSchema.type()
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType))
      return null
    return state.tr.delete(start, end).setBlockType(start, start, nodeType, { identity: getId() })
  }))

export const remarkDiagramPlugin = $remark(() => remarkMermaid)

export const insertDiagramCommand = $command('InsertDiagramCommand', () => () => setBlockType(diagramSchema.type(), { identity: getId() }))


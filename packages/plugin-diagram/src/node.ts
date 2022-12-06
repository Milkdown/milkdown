/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { InputRule } from '@milkdown/prose/inputrules'
import { NodeSelection } from '@milkdown/prose/state'
import { $command, $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import type { Config } from 'mermaid'
import mermaid from 'mermaid'

import { getId } from './utility'
import { remarkMermaid } from './remark-mermaid'

const id = 'diagram'

export const mermaidConfigCtx = $ctx<Config, 'mermaidConfig'>({ startOnLoad: false }, 'mermaidConfig')

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
      const code = node.attrs.value as string

      const dom = document.createElement('div')
      dom.id = identity
      dom.dataset.type = id
      dom.dataset.value = code

      mermaid.render(identity, code, (svg) => {
        dom.innerHTML = svg
      })

      return dom
    },
    parseMarkdown: {
      match: ({ type }) => type === id,
      runner: (state, node, type) => {
        const value = node.value as string
        state.addNode(type, { value })
      },
    },
    toMarkdown: {
      match: node => node.type.name === id,
      runner: (state, node) => {
        state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: 'mermaid' })
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
    const tr = state.tr.delete(start, end).setBlockType(start, start, nodeType, { id: getId() })

    return tr.setSelection(NodeSelection.create(tr.doc, start - 1))
  }))

export const remarkDiagramPlugin = $remark(() => remarkMermaid)

export const insertDiagramCommand = $command('InsertDiagramCommand', () => () => setBlockType(diagramSchema.type(), { id: getId() }))


/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { InputRule } from '@milkdown/prose/inputrules'
import { $command, $ctx, $inputRule, $nodeSchema, $remark } from '@milkdown/utils'
import type { MermaidConfig } from 'mermaid'
import mermaid from 'mermaid'

import { remarkMermaid } from './remark-mermaid'
import { getId } from './__internal__/get-id'
import { withMeta } from './__internal__/with-meta'

/// A slice that contains [options for mermaid](https://mermaid.js.org/config/setup/modules/config.html).
/// You can configure mermaid here.
/// ```ts
/// import { mermaidConfigCtx } from '@milkdown/plugin-diagram'
///
/// Editor.make()
///   .config((ctx) => {
///     ctx.set(mermaidConfigCtx.key, { /* some options */ });
///   })
/// ```
export const mermaidConfigCtx = $ctx<MermaidConfig, 'mermaidConfig'>({ startOnLoad: false }, 'mermaidConfig')

withMeta(mermaidConfigCtx, {
  displayName: 'Ctx<mermaidConfig>',
})

const id = 'diagram'
/// Schema for diagram node.
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

withMeta(diagramSchema.node, {
  displayName: 'NodeSchema<diagram>',
})
withMeta(diagramSchema.ctx, {
  displayName: 'NodeSchemaCtx<diagram>',
})

/// A input rule that will insert a diagram node when you type ` ```mermaid `.
export const insertDiagramInputRules = $inputRule(() =>
  new InputRule(/^```mermaid$/, (state, _match, start, end) => {
    const nodeType = diagramSchema.type()
    const $start = state.doc.resolve(start)
    if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType))
      return null
    return state.tr.delete(start, end).setBlockType(start, start, nodeType, { identity: getId() })
  }))

withMeta(insertDiagramInputRules, {
  displayName: 'InputRule<insertDiagramInputRules>',
})

/// A remark plugin that will parse mermaid code block.
export const remarkDiagramPlugin = $remark(() => remarkMermaid)

withMeta(remarkDiagramPlugin, {
  displayName: 'Remark<diagram>',
})

/// A command that will insert a diagram node.
export const insertDiagramCommand = $command('InsertDiagramCommand', () => () => setBlockType(diagramSchema.type(), { identity: getId() }))

withMeta(insertDiagramCommand, {
  displayName: 'Command<insertDiagramCommand>',
})

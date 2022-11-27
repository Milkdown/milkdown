/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { textblockTypeInputRule } from '@milkdown/prose/inputrules'
import { $command, $inputRule, $nodeSchema, $useKeymap } from '@milkdown/utils'

export const codeBlockSchema = $nodeSchema('code_block', () => {
  return {
    content: 'text*',
    group: 'block',
    marks: '',
    defining: true,
    code: true,
    attrs: {
      language: {
        default: '',
      },
    },
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          return { language: dom.dataset.language }
        },
      },
    ],
    toDOM: (node) => {
      return [
        'pre',
        {
          'data-language': node.attrs.language,
        },
        ['code', 0],
      ]
    },
    parseMarkdown: {
      match: ({ type }) => type === 'code',
      runner: (state, node, type) => {
        const language = node.lang as string
        const value = node.value as string
        state.openNode(type, { language })
        if (value)
          state.addText(value)

        state.closeNode()
      },
    },
    toMarkdown: {
      match: node => node.type.name === 'code_block',
      runner: (state, node) => {
        state.addNode('code', undefined, node.content.firstChild?.text || '', {
          lang: node.attrs.language,
        })
      },
    },
  }
})

export const createCodeBlockInputRule = $inputRule(() => textblockTypeInputRule(/^```(?<language>[a-z]*)?[\s\n]$/, codeBlockSchema.type(), match => ({
  language: match.groups?.language ?? '',
})))

export const createCodeBlockCommand = $command('CreateCodeBlock', () => (language = '') => setBlockType(codeBlockSchema.type(), { language }))

export const codeBlockKeymap = $useKeymap('codeBlockKeymap', {
  CreateCodeBlock: {
    shortcuts: 'Mod-Alt-c',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(createCodeBlockCommand.key)
    },
  },
})

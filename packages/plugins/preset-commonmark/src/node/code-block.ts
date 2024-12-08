import { commandsCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { setBlockType } from '@milkdown/prose/commands'
import { textblockTypeInputRule } from '@milkdown/prose/inputrules'
import {
  $command,
  $inputRule,
  $nodeAttr,
  $nodeSchema,
  $useKeymap,
} from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// HTML attributes for code block node.
export const codeBlockAttr = $nodeAttr('codeBlock', () => ({
  pre: {},
  code: {},
}))

withMeta(codeBlockAttr, {
  displayName: 'Attr<codeBlock>',
  group: 'CodeBlock',
})

/// Schema for code block node.
export const codeBlockSchema = $nodeSchema('code_block', (ctx) => {
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
          if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

          return { language: dom.dataset.language }
        },
      },
    ],
    toDOM: (node) => {
      const attr = ctx.get(codeBlockAttr.key)(node)
      return [
        'pre',
        {
          ...attr.pre,
          'data-language': node.attrs.language,
        },
        ['code', attr.code, 0],
      ]
    },
    parseMarkdown: {
      match: ({ type }) => type === 'code',
      runner: (state, node, type) => {
        const language = node.lang as string
        const value = node.value as string
        state.openNode(type, { language })
        if (value) state.addText(value)

        state.closeNode()
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'code_block',
      runner: (state, node) => {
        state.addNode('code', undefined, node.content.firstChild?.text || '', {
          lang: node.attrs.language,
        })
      },
    },
  }
})

withMeta(codeBlockSchema.node, {
  displayName: 'NodeSchema<codeBlock>',
  group: 'CodeBlock',
})

withMeta(codeBlockSchema.ctx, {
  displayName: 'NodeSchemaCtx<codeBlock>',
  group: 'CodeBlock',
})

/// A input rule for creating code block.
/// For example, ` ```javascript ` will create a code block with language javascript.
export const createCodeBlockInputRule = $inputRule((ctx) =>
  textblockTypeInputRule(
    /^```(?<language>[a-z]*)?[\s\n]$/,
    codeBlockSchema.type(ctx),
    (match) => ({
      language: match.groups?.language ?? '',
    })
  )
)

withMeta(createCodeBlockInputRule, {
  displayName: 'InputRule<createCodeBlockInputRule>',
  group: 'CodeBlock',
})

/// A command for creating code block.
/// You can pass the language of the code block as the parameter.
export const createCodeBlockCommand = $command(
  'CreateCodeBlock',
  (ctx) =>
    (language = '') =>
      setBlockType(codeBlockSchema.type(ctx), { language })
)

withMeta(createCodeBlockCommand, {
  displayName: 'Command<createCodeBlockCommand>',
  group: 'CodeBlock',
})

/// A command for updating the code block language of the target position.
export const updateCodeBlockLanguageCommand = $command(
  'UpdateCodeBlockLanguage',
  () =>
    (
      { pos, language }: { pos: number; language: string } = {
        pos: -1,
        language: '',
      }
    ) =>
    (state, dispatch) => {
      if (pos >= 0) {
        dispatch?.(state.tr.setNodeAttribute(pos, 'language', language))
        return true
      }

      return false
    }
)

withMeta(updateCodeBlockLanguageCommand, {
  displayName: 'Command<updateCodeBlockLanguageCommand>',
  group: 'CodeBlock',
})

/// Keymap for code block.
/// - `Mod-Alt-c`: Create a code block.
export const codeBlockKeymap = $useKeymap('codeBlockKeymap', {
  CreateCodeBlock: {
    shortcuts: 'Mod-Alt-c',
    command: (ctx) => {
      const commands = ctx.get(commandsCtx)
      return () => commands.call(createCodeBlockCommand.key)
    },
  },
})

withMeta(codeBlockKeymap.ctx, {
  displayName: 'KeymapCtx<codeBlock>',
  group: 'CodeBlock',
})

withMeta(codeBlockKeymap.shortcuts, {
  displayName: 'Keymap<codeBlock>',
  group: 'CodeBlock',
})

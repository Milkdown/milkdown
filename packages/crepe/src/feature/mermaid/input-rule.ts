import { codeBlockSchema } from '@milkdown/kit/preset/commonmark'
import { textblockTypeInputRule } from '@milkdown/kit/prose/inputrules'
import { $inputRule } from '@milkdown/kit/utils'


/// A input rule for creating mermaid.
/// For example, '```mermaid' will create a code block with language javascript.
export const mermaidBlockInputRule = $inputRule((ctx) =>
  textblockTypeInputRule(/^```mermaid[\s\n]$/, codeBlockSchema.type(ctx), () => ({
    language: 'mermaid',
  }))
)

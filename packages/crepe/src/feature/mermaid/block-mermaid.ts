import { codeBlockSchema } from '@milkdown/kit/preset/commonmark'

export const blockMermaidSchema = codeBlockSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx)
    return {
      ...baseSchema,
      toMarkdown: {
        match: baseSchema.toMarkdown.match,
        runner: (state, node) => {
          const language = node.attrs.language ?? ''
          if (language.toLowerCase() === 'mermaid') {
            state.addNode(
              'code',
              undefined,
              node.content.firstChild?.text || ''
            )
          } else {
            return baseSchema.toMarkdown.runner(state, node)
          }
        },
      },
    }
  }
})

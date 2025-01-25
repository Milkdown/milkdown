import { codeBlockSchema } from '@milkdown/kit/preset/commonmark'

export const blockLatexSchema = codeBlockSchema.extendSchema((prev) => {
  return (ctx) => {
    const baseSchema = prev(ctx)
    return {
      ...baseSchema,
      toMarkdown: {
        match: baseSchema.toMarkdown.match,
        runner: (state, node) => {
          const language = node.attrs.language ?? ''
          if (language.toLowerCase() === 'latex') {
            state.addNode(
              'math',
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

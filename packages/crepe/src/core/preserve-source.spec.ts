import { editorViewCtx } from '@milkdown/kit/core'
import { setMarkdownSource } from '@milkdown/kit/utils'
import { describe, expect, it, vi } from 'vitest'

import { Crepe } from './crepe'

// jsdom has no IntersectionObserver. A code block waits for one before it
// mounts its editor, so a stub that never fires keeps the block unmounted.
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
)

// One block for every feature that touches the document or its markdown.
const markdown = [
  'Title',
  '=====',
  '',
  '- a',
  '- b',
  '',
  '![alt](a.webp)',
  '',
  '$$',
  'x^2',
  '$$',
  '',
  '|a|b|',
  '|-|-|',
  '|1|2|',
  '',
  'See [the link][ref] and $y$.',
  '',
  '[ref]: https://example.com',
  '',
  '~~~js',
  'code',
  '~~~',
  '',
  '> quote',
  '',
  '1) one',
  '2) two',
  '   - [ ] nested task',
  '',
  'a  ',
  'b',
  '',
  '---',
  '',
  '<div>html</div>',
].join('\n')

async function withCrepe<T>(
  config: ConstructorParameters<typeof Crepe>[0],
  fn: (crepe: Crepe) => T | Promise<T>,
  setup?: (crepe: Crepe) => void
): Promise<T> {
  const crepe = new Crepe(config)
  setup?.(crepe)
  await crepe.create()
  try {
    return await fn(crepe)
  } finally {
    await crepe.destroy()
  }
}

describe('preserveSource', () => {
  it('gives back the markdown of a document that was not edited', async () => {
    await withCrepe({ defaultValue: markdown, preserveSource: true }, (crepe) =>
      expect(crepe.getMarkdown()).toBe(markdown)
    )
  })

  it('writes only the block that changed', async () => {
    await withCrepe(
      { defaultValue: markdown, preserveSource: true },
      (crepe) => {
        crepe.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          // Type at the end of the heading, the first block.
          const end = view.state.doc.firstChild!.nodeSize - 1
          view.dispatch(view.state.tr.insertText('!', end))
        })

        // The image block, the math block, the table and the reference
        // link all keep the text they had.
        expect(crepe.getMarkdown()).toBe(
          markdown.replace('Title\n=====', '# Title!')
        )
      }
    )
  })

  it('is off by default', async () => {
    await withCrepe({ defaultValue: 'Title\n=====' }, (crepe) =>
      expect(crepe.getMarkdown()).toBe('# Title\n')
    )
  })

  it('reports the source as the previous markdown', async () => {
    const calls: [markdown: string, prevMarkdown: string][] = []

    await withCrepe(
      { defaultValue: markdown, preserveSource: true },
      async (crepe) => {
        crepe.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          view.dispatch(view.state.tr.insertText('!', 2))
        })
        // The listener waits 200ms before it reports a change.
        await new Promise((resolve) => setTimeout(resolve, 300))

        expect(calls).toHaveLength(1)
        expect(calls[0]?.[1]).toBe(markdown)
        expect(calls[0]?.[0]).toBe(crepe.getMarkdown())
        expect(calls[0]?.[0]).not.toBe(markdown)
      },
      (crepe) => {
        crepe.on((listener) => {
          listener.markdownUpdated((_ctx, next, prev) => {
            calls.push([next, prev])
          })
        })
      }
    )
  })
  it('reports the previous markdown with a source that was set later', async () => {
    const json = await withCrepe({ defaultValue: markdown }, (crepe) =>
      crepe.editor.action((ctx) => ctx.get(editorViewCtx).state.doc.toJSON())
    )
    const calls: [markdown: string, prevMarkdown: string][] = []

    await withCrepe(
      { defaultValue: { type: 'json', value: json }, preserveSource: true },
      async (crepe) => {
        // A document from JSON has no source. This transaction gives it
        // one and changes nothing else.
        crepe.editor.action(setMarkdownSource(markdown))
        expect(crepe.getMarkdown()).toBe(markdown)

        crepe.editor.action((ctx) => {
          const view = ctx.get(editorViewCtx)
          view.dispatch(view.state.tr.insertText('!', 2))
        })
        await new Promise((resolve) => setTimeout(resolve, 300))

        expect(calls).toHaveLength(1)
        expect(calls[0]?.[1]).toBe(markdown)
        expect(calls[0]?.[0]).toBe(crepe.getMarkdown())
      },
      (crepe) => {
        crepe.on((listener) => {
          listener.markdownUpdated((_ctx, next, prev) => {
            calls.push([next, prev])
          })
        })
      }
    )
  })
  it('keeps the sources of two editors on one page apart', async () => {
    const other = '- a\n- b\n\n|x|y|\n|-|-|\n|1|2|'

    await withCrepe({ defaultValue: markdown, preserveSource: true }, (first) =>
      withCrepe({ defaultValue: other, preserveSource: true }, (second) =>
        withCrepe({ defaultValue: other }, (off) => {
          expect(first.getMarkdown()).toBe(markdown)
          expect(second.getMarkdown()).toBe(other)
          expect(off.getMarkdown()).not.toBe(other)

          second.editor.action((ctx) => {
            const view = ctx.get(editorViewCtx)
            view.dispatch(view.state.tr.insertText('!', 3))
          })
          expect(second.getMarkdown()).not.toBe(other)
          expect(first.getMarkdown()).toBe(markdown)
        })
      )
    )
  })
})

import type { Node } from '@milkdown/prose/model'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { describe, expect, it } from 'vitest'

import { remarkImageBlockPlugin } from '../remark-plugin'
import { imageBlockSchema } from '../schema'

/// Load `markdown` into an editor that turns a lone image into an image block,
/// and give the parsed document to `fn`.
async function withImageBlock<T>(
  markdown: string,
  fn: (doc: Node) => T
): Promise<T> {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, markdown)
  })
  editor.use(commonmark).use(remarkImageBlockPlugin).use(imageBlockSchema)
  await editor.create()
  try {
    return editor.action((ctx) => fn(ctx.get(editorViewCtx).state.doc))
  } finally {
    await editor.destroy().catch(() => {})
  }
}

// caption is a validated string attribute, and mdast gives null for a title
// that the markdown omits. `Node.check` runs that validation, so the block was
// invalid against its own schema.
describe('an image block without a title', () => {
  it('parses to a document that is valid against the schema', async () => {
    await withImageBlock('![1.00](b.png)\n', (doc) => {
      expect(() => doc.check()).not.toThrow()
      expect(doc.firstChild?.type.name).toBe('image-block')
      expect(doc.firstChild?.attrs.caption).toBe('')
      expect(doc.firstChild?.attrs.src).toBe('b.png')
    })
  })
})

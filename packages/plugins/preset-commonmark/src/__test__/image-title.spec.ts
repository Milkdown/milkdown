import { editorViewCtx } from '@milkdown/core'
import { describe, expect, it } from 'vitest'

import { roundTrip, withEditor } from './test-utils'

// The image node declares alt and title as string attributes, and mdast gives
// null for the ones the markdown omits. `Node.check` runs that validation, and
// prosemirror-model also runs it in NodeType.create from version 1.25.12. There
// the parser throws a RangeError and the image never reaches the document.
describe('an image without a title', () => {
  it('parses to a document that is valid against the schema', async () => {
    await withEditor('![a](b.png)\n', (editor) =>
      editor.action((ctx) => {
        const doc = ctx.get(editorViewCtx).state.doc
        expect(() => doc.check()).not.toThrow()
        const image = doc.firstChild?.firstChild
        expect(image?.type.name).toBe('image')
        expect(image?.attrs.src).toBe('b.png')
        expect(image?.attrs.alt).toBe('a')
        expect(image?.attrs.title).toBe('')
      })
    )
  })

  it('round-trips and grows no empty title', async () => {
    expect(await roundTrip('![a](b.png)\n')).toBe('![a](b.png)\n')
  })

  it('round-trips with no alt text either', async () => {
    expect(await roundTrip('![](b.png)\n')).toBe('![](b.png)\n')
  })

  it('keeps a title that the markdown does carry', async () => {
    expect(await roundTrip('![a](b.png "t")\n')).toBe('![a](b.png "t")\n')
  })
})

import '@testing-library/jest-dom/vitest'
import { defaultValueCtx, Editor } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { gfm } from '..'

async function createEditor(defaultValue: string) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  editor.use(commonmark)
  editor.use(gfm)
  await editor.create()
  return editor
}

async function roundTrip(markdown: string) {
  const editor = await createEditor(markdown)
  return editor.action(getMarkdown())
}

describe('inline br in gfm containers', () => {
  it('does not drop a footnote whose serializer emitted a block <br>', async () => {
    const input = '[^note]: foo\n\n    <br />\n\n    bar\n\n'
    const output = await roundTrip(input)
    expect(output).toContain('[^note]')
    expect(output).toMatch(/foo/)
    expect(output).toMatch(/bar/)
  })

  it('still treats a lone table-cell <br> as an empty-line placeholder', async () => {
    const output = await roundTrip('| <br> | c |\n| --- | --- |\n')
    expect(output).toMatch(/\|/)
    expect(output).toContain('c')
  })
})

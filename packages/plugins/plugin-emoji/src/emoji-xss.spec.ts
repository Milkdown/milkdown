import { Editor, schemaCtx, serializerCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { DOMParser } from '@milkdown/prose/model'
import '@testing-library/jest-dom/vitest'
import { expect, test } from 'vitest'

import { emoji } from '.'

async function createEditor() {
  const editor = Editor.make().use(commonmark).use(emoji)
  await editor.create()
  return editor
}

// Simulates a pasted `<span data-type="emoji">` carrying an XSS payload.
const MALICIOUS_EMOJI_HTML =
  '<p><span data-type="emoji"><img src="x" onerror="globalThis.__xss = true"></span></p>'

test('parseDOM strips event handlers from pasted emoji html', async () => {
  const editor = await createEditor()
  const schema = editor.ctx.get(schemaCtx)

  const dom = document.createElement('div')
  dom.innerHTML = MALICIOUS_EMOJI_HTML
  const doc = DOMParser.fromSchema(schema).parse(dom)

  let emojiHtml: string | undefined
  doc.descendants((node) => {
    if (node.type.name === 'emoji') emojiHtml = node.attrs.html as string
  })

  expect(emojiHtml).toBeDefined()
  // The unsanitized value must never enter the document state.
  expect(emojiHtml).not.toContain('onerror')
})

test('serializing a malicious emoji node does not execute the payload', async () => {
  const editor = await createEditor()
  const schema = editor.ctx.get(schemaCtx)

  const dom = document.createElement('div')
  dom.innerHTML = MALICIOUS_EMOJI_HTML
  const doc = DOMParser.fromSchema(schema).parse(dom)

  // Even if an unsanitized `onerror` payload reached this node, serializing
  // through an inert `<template>` must not run it.
  ;(globalThis as Record<string, unknown>).__xss = false
  const serializer = editor.ctx.get(serializerCtx)
  expect(() => serializer(doc)).not.toThrow()
  expect((globalThis as Record<string, unknown>).__xss).toBe(false)
})

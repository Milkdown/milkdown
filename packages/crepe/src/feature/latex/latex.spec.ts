import {
  Editor,
  defaultValueCtx,
  editorViewCtx,
  rootCtx,
} from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { describe, expect, test } from 'vitest'

import { mathInlineSchema } from './inline-latex'
import { mathInlineRegex } from './input-rule'
import { remarkInlineMathGuardPlugin, remarkMathPlugin } from './remark'

async function parse(markdown: string) {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, document.createElement('div'))
      ctx.set(defaultValueCtx, markdown)
    })
    .use(commonmark)
    .use(remarkMathPlugin)
    .use(remarkInlineMathGuardPlugin)
    .use(mathInlineSchema)
  await editor.create()
  return editor.ctx.get(editorViewCtx).state.doc
}

function hasMath(doc: Awaited<ReturnType<typeof parse>>) {
  let found = false
  doc.descendants((node) => {
    if (node.type.name === 'math_inline') found = true
  })
  return found
}

describe('inline math parsing', () => {
  test.each([
    'Lunch was $5 and dinner $10.',
    'costs $ 5 and $ 10',
    'a $x $ b',
    'it is $5 and $10 and more',
  ])('keeps "%s" as plain text', async (md) => {
    expect(hasMath(await parse(md))).toBe(false)
  })

  test.each(['$E=mc^2$', 'a $x$ b', 'cost $5$ today'])(
    'parses "%s" as math',
    async (md) => {
      expect(hasMath(await parse(md))).toBe(true)
    }
  )
})

describe('inline math input rule', () => {
  test.each(['$E=mc^2$', '$x$', 'a $a b$'])('matches "%s"', (text) => {
    expect(mathInlineRegex.test(text)).toBe(true)
  })

  test.each(['Lunch was $5 and dinner $', '$ x$', '$x $', '$$', '$'])(
    'does not match "%s"',
    (text) => {
      expect(mathInlineRegex.test(text)).toBe(false)
    }
  )
})

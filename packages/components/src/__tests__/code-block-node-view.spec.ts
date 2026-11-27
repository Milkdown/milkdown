import { defaultValueCtx, Editor } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { codeBlockComponent, codeBlockConfig } from '../code-block'

type ObserverCallback = (
  entries: Array<{ target: Element; isIntersecting: boolean }>
) => void

let observerCallback: ObserverCallback | undefined
const observedElements: Element[] = []
const editors: Editor[] = []

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback
  }

  observe(element: Element) {
    observedElements.push(element)
  }

  unobserve(element: Element) {
    const index = observedElements.indexOf(element)
    if (index >= 0) observedElements.splice(index, 1)
  }

  disconnect() {}
}

beforeEach(() => {
  observerCallback = undefined
  observedElements.length = 0
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
  vi.unstubAllGlobals()
  document.body.replaceChildren()
})

describe('code block initialization failure recovery', () => {
  it('destroys cleanly after CodeMirror initialization throws', async () => {
    const root = document.createElement('div')
    document.body.appendChild(root)

    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(codeBlockConfig.key, {
          ...ctx.get(codeBlockConfig.key),
          extensions: [{} as never],
        })
      })
      .use(commonmark)
      .use(codeBlockComponent)
    editors.push(editor)

    await editor
      .config((ctx) => {
        ctx.set(defaultValueCtx, '```js\nconst a = 1\n```\n')
      })
      .create()

    const target = observedElements.find((el) =>
      el.classList.contains('milkdown-code-block')
    )
    expect(target).toBeDefined()

    expect(() =>
      observerCallback?.([{ target: target!, isIntersecting: true }])
    ).toThrow(/Unrecognized extension value/)

    // Leaving the viewport later must not read properties of an unmounted view.
    expect(() =>
      observerCallback?.([{ target: target!, isIntersecting: false }])
    ).not.toThrow()

    await expect(editor.destroy()).resolves.toBeDefined()
    editors.pop()
  })

  it('mounts and destroys cleanly when CodeMirror configuration is valid', async () => {
    const editor = Editor.make().use(commonmark).use(codeBlockComponent)
    editors.push(editor)

    await editor
      .config((ctx) => {
        ctx.set(defaultValueCtx, '```js\nconst b = 2\n```\n')
      })
      .create()

    const target = observedElements.find((el) =>
      el.classList.contains('milkdown-code-block')
    )
    expect(target).toBeDefined()

    expect(() =>
      observerCallback?.([{ target: target!, isIntersecting: true }])
    ).not.toThrow()

    await expect(editor.destroy()).resolves.toBeDefined()
    editors.pop()
  })
})

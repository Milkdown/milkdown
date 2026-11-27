import type { Extension } from '@codemirror/state'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { NodeSelection, TextSelection } from '@milkdown/prose/state'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import {
  type CodeBlockConfig,
  codeBlockComponent,
  codeBlockConfig,
  CodeMirrorBlock,
} from '..'

// A manual intersection observer. CodeMirror creates observers of its own,
// so each stub keeps its own callback and targets.
const observers = new Set<StubIntersectionObserver>()

class StubIntersectionObserver {
  readonly targets = new Set<Element>()
  constructor(readonly callback: IntersectionObserverCallback) {
    observers.add(this)
  }
  observe(target: Element) {
    this.targets.add(target)
  }
  unobserve(target: Element) {
    this.targets.delete(target)
  }
  disconnect() {
    this.targets.clear()
    observers.delete(this)
  }
}

// The code block view keeps one observer for the module, so keep the stub
// for the whole file.
vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)

function setVisible(target: Element, isIntersecting: boolean) {
  for (const observer of observers) {
    if (!observer.targets.has(target)) continue
    observer.callback(
      [{ target, isIntersecting } as IntersectionObserverEntry],
      observer as unknown as IntersectionObserver
    )
  }
}

const isObserved = (target: Element) =>
  Array.from(observers).some((observer) => observer.targets.has(target))

// CodeMirror rejects a value that is not an extension.
const invalidExtension = {} as Extension

const editors: Editor[] = []
const reportError = vi.fn<(error: unknown) => void>()

beforeEach(() => {
  vi.stubGlobal('reportError', reportError)
})

afterEach(async () => {
  for (const editor of editors.splice(0)) await editor.destroy()
  reportError.mockReset()
  vi.unstubAllGlobals()
  vi.stubGlobal('IntersectionObserver', StubIntersectionObserver)
  vi.useRealTimers()
})

async function createEditor(
  config: Partial<CodeBlockConfig>,
  markdown = '```js\nconst a = 1\n```\n'
) {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(defaultValueCtx, markdown)
      ctx.update(codeBlockConfig.key, (prev) => ({ ...prev, ...config }))
    })
    .use(commonmark)
    .use(codeBlockComponent)
  await editor.create()
  editors.push(editor)
  const view = editor.ctx.get(editorViewCtx)
  const dom = view.dom.querySelector<HTMLElement>('.milkdown-code-block')!
  return { editor, view, dom }
}

const placeholderOf = (dom: HTMLElement) =>
  dom.querySelector('.milkdown-code-block-placeholder')

describe('CodeMirrorBlock initialization failure', () => {
  it('keeps a single placeholder and reports the error', async () => {
    const { dom } = await createEditor({ extensions: [invalidExtension] })

    expect(() => setVisible(dom, true)).not.toThrow()

    expect(reportError).toHaveBeenCalledTimes(1)
    expect(dom.children).toHaveLength(1)
    expect(placeholderOf(dom)?.textContent).toBe('const a = 1')
    expect(dom.querySelector('.cm-editor')).toBeNull()
  })

  it('destroys the editor cleanly', async () => {
    const { editor, dom } = await createEditor({
      extensions: [invalidExtension],
    })
    setVisible(dom, true)

    editors.splice(editors.indexOf(editor), 1)
    await expect(editor.destroy()).resolves.toBe(editor)
    expect(isObserved(dom)).toBe(false)
  })

  it('does not schedule a teardown when the block leaves the viewport', async () => {
    vi.useFakeTimers()
    const { dom } = await createEditor({ extensions: [invalidExtension] })
    setVisible(dom, true)

    setVisible(dom, false)

    expect(() =>
      vi.advanceTimersByTime(CodeMirrorBlock.TEARDOWN_DELAY)
    ).not.toThrow()
    expect(placeholderOf(dom)).not.toBeNull()
  })

  it('does not retry with the same extensions', async () => {
    const { view, dom } = await createEditor({
      extensions: [invalidExtension],
    })
    setVisible(dom, true)
    setVisible(dom, false)

    setVisible(dom, true)
    view.dispatch(
      view.state.tr.setSelection(NodeSelection.create(view.state.doc, 0))
    )

    expect(reportError).toHaveBeenCalledTimes(1)
    expect(placeholderOf(dom)).not.toBeNull()
  })

  it('retries after the extensions change', async () => {
    const { editor, dom } = await createEditor({
      extensions: [invalidExtension],
    })
    setVisible(dom, true)
    setVisible(dom, false)

    editor.ctx.update(codeBlockConfig.key, (config) => ({
      ...config,
      extensions: [],
    }))
    setVisible(dom, true)

    expect(dom.querySelector('.cm-editor')).not.toBeNull()
    expect(placeholderOf(dom)).toBeNull()
  })

  it('does not throw when the failed block is selected', async () => {
    const { view, dom } = await createEditor({
      extensions: [invalidExtension],
    })

    expect(() =>
      view.dispatch(
        view.state.tr.setSelection(NodeSelection.create(view.state.doc, 0))
      )
    ).not.toThrow()

    expect(reportError).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(dom.classList.contains('selected')).toBe(true)
    expect(placeholderOf(dom)).not.toBeNull()
  })

  it('does not throw when the caret moves into the failed block', async () => {
    const { view, dom } = await createEditor(
      { extensions: [invalidExtension] },
      'text\n\n```js\nconst a = 1\n```\n'
    )
    view.focus()
    const blockPos = view.state.doc.firstChild!.nodeSize

    expect(() =>
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, blockPos + 1)
        )
      )
    ).not.toThrow()

    // ProseMirror asked the block for the selection, which tried to
    // initialize it.
    expect(reportError).toHaveBeenCalledTimes(1)
    expect(placeholderOf(dom)).not.toBeNull()
  })
})

describe('CodeMirrorBlock mount failure', () => {
  it('restores the placeholder when mounting the UI throws', async () => {
    const { editor, dom } = await createEditor({})
    const error = new Error('insert failed')
    // Vue inserts the UI with `insertBefore`. A DOM error there is not a
    // component error, so it escapes `mount`.
    dom.insertBefore = () => {
      throw error
    }

    expect(() => setVisible(dom, true)).not.toThrow()
    Reflect.deleteProperty(dom, 'insertBefore')

    expect(reportError).toHaveBeenCalledWith(error)
    expect(dom.children).toHaveLength(1)
    expect(placeholderOf(dom)?.textContent).toBe('const a = 1')

    editors.splice(editors.indexOf(editor), 1)
    await expect(editor.destroy()).resolves.toBe(editor)
  })
})

describe('CodeMirrorBlock component errors', () => {
  it('still initializes when renderPreview throws', async () => {
    const error = new Error('preview failed')
    const { editor, dom } = await createEditor({
      renderPreview: () => {
        throw error
      },
    })

    expect(() => setVisible(dom, true)).not.toThrow()

    expect(reportError).toHaveBeenCalledWith(error)
    expect(dom.querySelector('.cm-editor')).not.toBeNull()
    expect(placeholderOf(dom)).toBeNull()

    editors.splice(editors.indexOf(editor), 1)
    await expect(editor.destroy()).resolves.toBe(editor)
  })
})

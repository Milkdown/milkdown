/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from '@milkdown/core'
import { editorViewCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import type { Node } from '@milkdown/prose/model'
import { Fragment } from '@milkdown/prose/model'
import type { EditorState, Transaction } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { $ctx } from '@milkdown/utils'
import { codeBlockSchema } from '../node'

export type OnBuild = (
  Root: HTMLElement,
  Content: HTMLElement,
  props: {
    node: Node
    setLanguage: (language: string) => void
    getContent: () => void
  }
) => void

export class CodeBlockFrameConfig {
  #ctx!: Ctx

  #builder: OnBuild = (Root, Content) => {
    Root.appendChild(Content)
  }

  bindCtx = (ctx: Ctx) => {
    this.#ctx = ctx
  }

  build = (Root: HTMLElement, Content: HTMLElement, node: Node) => {
    const getNode = this.#getNode
    const props = {
      setLanguage: this.#setLanguage(Root),
      getContent: this.#getContent(Root),
      get node() {
        return getNode(Root) || node
      },
    }

    this.#builder(Root, Content, props)
  }

  get view(): EditorView {
    return this.#ctx.get(editorViewCtx)
  }

  get state(): EditorState {
    return this.view.state
  }

  get tr(): Transaction {
    return this.state.tr
  }

  #getPos = (dom: HTMLElement) => {
    if (!this.view.posAtCoords)
      return null
    const { top, left } = dom.getBoundingClientRect()
    return this.view.posAtCoords({ left, top })
  }

  #getNode = (Root: HTMLElement) => {
    const pos = this.#getPos(Root)
    if (pos === null)
      return null

    return this.state.doc.nodeAt(pos.inside)
  }

  #setLanguage = (Root: HTMLElement) => (language: string) => {
    const pos = this.#getPos(Root)
    if (pos === null)
      return

    Root.dataset.language = language
    this.view.dispatch(this.tr.setNodeAttribute(pos.inside, 'language', language))
  }

  #getContent = (Root: HTMLElement) => () => {
    return this.#getNode(Root)?.textContent || ''
  }

  onBuild = (builder: OnBuild) => {
    this.#builder = builder
  }
}

export const codeBlockFrameConfig = $ctx<CodeBlockFrameConfig, 'codeBlockFrameConfig'>(new CodeBlockFrameConfig(), 'codeBlockFrameConfig')

export const codeBlockFrame = codeBlockSchema.extendSchema(prev => (ctx) => {
  const config = ctx.get(codeBlockFrameConfig.key)
  config.bindCtx(ctx)
  const originalSchema = prev(ctx)

  return {
    ...originalSchema,
    toDOM: (node) => {
      const Root = document.createElement('div')
      const Content = document.createElement('pre')
      Root.dataset.language = node.attrs.language
      Root.dataset.role = 'code-block-frame-root'
      Content.dataset.role = 'code-block-frame-content'
      config.build(Root, Content, node)

      return {
        dom: Root,
        contentDOM: Content,
      }
    },
    parseDOM: [
      ...originalSchema.parseDOM || [],
      {
        tag: 'div[data-role="code-block-frame-root"]',
        preserveWhitespace: 'full',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          return { language: dom.dataset.language }
        },
        getContent: (dom, schema) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          const text = dom.querySelector('pre[data-role="code-block-frame-content"]')?.textContent ?? ''
          if (!text)
            return Fragment.empty

          const textNode = schema.text(text)
          return Fragment.from(textNode)
        },
      },
    ],
  }
})

/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from '@milkdown/core'
import { editorViewCtx } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { Fragment } from '@milkdown/prose/model'
import type { EditorState, Transaction } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { $ctx } from '@milkdown/utils'
import { codeBlockSchema } from '../node'

type OnBuild = (Root: HTMLElement, Content: HTMLElement, props: { setLanguage: (language: string) => void }) => void

export class CodeBlockFrameConfig {
  #ctx!: Ctx

  #builder: OnBuild = (Root, Content) => {
    Root.appendChild(Content)
  }

  bindCtx = (ctx: Ctx) => {
    this.#ctx = ctx
  }

  build = (Root: HTMLElement, Content: HTMLElement) => {
    const props = {
      setLanguage: this.setLanguage(Root),
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
    const { top, left } = dom.getBoundingClientRect()
    return this.view.posAtCoords({ left, top })
  }

  setLanguage = (Root: HTMLElement) => (language: string) => {
    const pos = this.#getPos(Root)
    if (pos === null)
      return

    Root.dataset.language = language
    this.view.dispatch(this.tr.setNodeAttribute(pos.inside, 'language', language))
  }

  onBuild = (builder: OnBuild) => {
    this.#builder = builder
  }
}

export const codeBlockFrameConfig = $ctx<CodeBlockFrameConfig, 'codeBlockFrameConfig'>(new CodeBlockFrameConfig(), 'codeBlockFrameConfig')

export const codeBlockFrame = codeBlockSchema.extendSchema(prev => (ctx) => {
  const config = ctx.get(codeBlockFrameConfig.slice)
  config.bindCtx(ctx)
  const originalSchema = prev(ctx)

  return {
    ...originalSchema,
    toDOM: () => {
      const Root = document.createElement('div')
      const Content = document.createElement('pre')
      Root.dataset.language = ''
      Root.dataset.role = 'code-block-frame-root'
      Content.dataset.role = 'code-block-frame-content'
      config.build(Root, Content)

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

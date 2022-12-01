/* Copyright 2021, Milkdown by Mirone. */
import { editorViewCtx, parserCtx } from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'
import { ReactEditor } from '@milkdown/react'
import { getMarkdown } from '@milkdown/utils'
import { forwardRef, useContext, useImperativeHandle } from 'react'
import { useSearchParams } from 'react-router-dom'

import { encode } from '../../utils/share'
import { shareCtx } from '../Context'
import { showToastCtx } from '../Toast'
import { Loading } from './Loading'
import className from './style.module.css'
import type { Content } from './useLazy'
import { useLazy } from './useLazy'
import { useOnlineEditorFactory } from './useOnlineEditor'

interface Props {
  content: Content
  readOnly?: boolean
  onChange?: (markdown: string) => void
}

export interface MilkdownRef { update: (markdown: string) => void }
export const OnlineEditor = forwardRef<MilkdownRef, Props>(({ content, readOnly, onChange }, ref) => {
  const showToast = useContext(showToastCtx)
  const share = useContext(shareCtx)
  const [_, setSearchParams] = useSearchParams()

  const [loading, md] = useLazy(content)

  const {
    get,
    loading: editorLoading,
  } = useOnlineEditorFactory(md, readOnly, onChange)

  useImperativeHandle(ref, () => ({
    update: (markdown: string) => {
      if (editorLoading)
        return
      const editor = get()
      editor?.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        const parser = ctx.get(parserCtx)
        const doc = parser(markdown)
        if (!doc)
          return
        const state = view.state
        view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)))
      })
    },
  }))

  share.current = () => {
    const editor = get()
    if (!editor)
      return

    const content = editor.action(getMarkdown())
    const base64 = encode(content)

    if (base64.length > 2000) {
      console.warn('Share content is too long.')
      showToast('error', 'Content in editor is too long to share, please reduce the content.')
      return
    }

    const url = new URL(location.href)
    url.searchParams.set('text', base64)
    navigator.clipboard.writeText(url.toString())
    setSearchParams({ text: base64 })
    showToast('success', 'Link has been copied to clipboard!')
  }

  return <div className={className.editor}>{loading ? <Loading /> : <ReactEditor />}</div>
})

OnlineEditor.displayName = 'OnlineEditor'

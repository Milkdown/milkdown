/* Copyright 2021, Milkdown by Mirone. */
import { createContext, useContext, useLayoutEffect, useRef } from 'react'

import { portalContext } from './Portals'
import type { EditorInfoCtx, GetEditor } from './types'

export const editorInfoContext = createContext<EditorInfoCtx>({} as EditorInfoCtx)

export const useGetEditor = (getEditor: GetEditor) => {
  const renderReact = useContext(portalContext)
  const { dom, editor: editorRef, setLoading } = useContext(editorInfoContext)
  const domRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  useLayoutEffect(() => {
    if (editorRef.current)
      editorRef.current.destroy()

    const div = domRef.current
    if (!div)
      return
    dom.current = div

    const editor = getEditor(div, renderReact)
    if (!editor)
      return

    if (loadingRef.current)
      return

    loadingRef.current = true
    setLoading(true)

    editor
      .create()
      .then((editor) => {
        editorRef.current = editor
      })
      .finally(() => {
        loadingRef.current = false
        setLoading(false)
      })
      .catch(console.error)

    return () => {
      editor.destroy()
    }
  }, [dom, editorRef, getEditor, renderReact, setLoading])

  return domRef
}

/* Copyright 2021, Milkdown by Mirone. */
import { createContext, useContext, useLayoutEffect, useRef } from 'react'

import type { EditorInfoCtx } from './types'

export const editorInfoContext = createContext<EditorInfoCtx>({} as EditorInfoCtx)

export const useGetEditor = () => {
  const { dom, editor: editorRef, setLoading, editorFactory: getEditor } = useContext(editorInfoContext)
  const domRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!getEditor)
      return

    const div = domRef.current
    if (!div)
      return
    dom.current = div

    const editor = getEditor(div)
    if (!editor)
      return

    setLoading(true)
    editor
      .create()
      .then((editor) => {
        editorRef.current = editor
      })
      .finally(() => {
        setLoading(false)
      })
      .catch(console.error)

    return () => {
      editor.destroy()
    }
  }, [dom, editorRef, getEditor, setLoading])

  return domRef
}

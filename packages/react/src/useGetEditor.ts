/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import { createContext, useContext, useLayoutEffect, useRef } from 'react'

import type { EditorInfoCtx } from './types'

export const editorInfoContext = createContext<EditorInfoCtx>({} as EditorInfoCtx)

export const useGetEditor = () => {
  const { dom, editor: editorRef, setLoading, editorFactory: getEditor } = useContext(editorInfoContext)
  const mapRef = useRef(new Map<string, Editor>())
  const domRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const map = mapRef.current
    // if (effectRan.current === true)
    //   return

    if (!getEditor)
      return

    const div = domRef.current
    if (!div)
      return
    dom.current = div

    const editor = getEditor(div)
    if (!editor)
      return

    const id = Math.random().toString(36).slice(2)
    map.set(id, editor)

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
      map.get(id)?.destroy()
    }
  }, [dom, editorRef, getEditor, setLoading])

  return domRef
}

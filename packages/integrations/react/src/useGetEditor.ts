import { createContext, useContext, useEffect, useRef } from 'react'

import type { EditorInfoCtx } from './types'

export const editorInfoContext = createContext<EditorInfoCtx>(
  {} as EditorInfoCtx
)

export function useGetEditor() {
  const {
    dom,
    editor: editorRef,
    setLoading,
    editorFactory: getEditor,
  } = useContext(editorInfoContext)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const div = domRef.current

    if (!getEditor) return

    if (!div) return

    dom.current = div

    const editor = getEditor(div)
    if (!editor) return

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
      editorRef.current?.destroy()
    }
  }, [dom, editorRef, getEditor, setLoading])

  return domRef
}

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

    if ('editor' in editor) {
      editorRef.current = editor.editor
    } else {
      editorRef.current = editor
    }

    setLoading(true)
    editor
      .create()
      .finally(() => {
        setLoading(false)
      })
      .catch(console.error)

    return () => {
      editor.destroy().catch(console.error)
    }
  }, [dom, editorRef, getEditor, setLoading])

  return domRef
}

import type { DependencyList } from 'react'
import { useCallback, useContext, useLayoutEffect } from 'react'

import type { GetEditor, UseEditorReturn } from './types'
import { editorInfoContext } from './use-get-editor'

export function useEditor(
  getEditor: GetEditor,
  deps: DependencyList = []
): UseEditorReturn {
  const editorInfo = useContext(editorInfoContext)

  const factory = useCallback(getEditor, deps)

  useLayoutEffect(() => {
    editorInfo.setEditorFactory(() => factory)
  }, [editorInfo, factory])

  return {
    loading: editorInfo.loading,
    get: () => editorInfo.editor.current,
  }
}

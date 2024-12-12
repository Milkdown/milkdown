import { inject } from 'vue'
import { editorInfoCtxKey } from './consts'

import type { GetEditor, UseEditorReturn } from './types'

export function useEditor(getEditor: GetEditor): UseEditorReturn {
  const { editorFactory, loading, editor } = inject(editorInfoCtxKey)!

  editorFactory.value = getEditor

  return {
    loading,
    get: () => editor.value,
  }
}

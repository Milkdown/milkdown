import { inject } from 'vue'

import type { GetEditor, UseEditorReturn } from './types'

import { editorInfoCtxKey } from './consts'

export function useEditor(getEditor: GetEditor): UseEditorReturn {
  const { editorFactory, loading, editor } = inject(editorInfoCtxKey)!

  editorFactory.value = getEditor

  return {
    loading,
    get: () => editor.value,
  }
}

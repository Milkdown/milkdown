import { inject, onMounted, onUnmounted } from 'vue'

import type { EditorInfoCtx } from './types'
import { editorInfoCtxKey } from './consts'

export function useGetEditor() {
  const {
    dom,
    loading,
    editor: editorRef,
    editorFactory: getEditor,
  } = inject(editorInfoCtxKey, {} as EditorInfoCtx)

  onMounted(() => {
    if (!dom.value) return

    const editor = getEditor.value!(dom.value)
    if (!editor) return

    loading.value = true
    editor
      .create()
      .then((editor) => {
        editorRef.value = editor
      })
      .finally(() => {
        loading.value = false
      })
      .catch(console.error)
  })
  onUnmounted(() => {
    editorRef.value?.destroy()
  })

  return dom
}

import { Crepe } from '@milkdown/crepe'
import { inject, onMounted, onUnmounted } from 'vue'

import type { EditorInfoCtx } from './types'
import { editorInfoCtxKey } from '.'

export function useGetEditor() {
  const { dom, loading, editor: editorRef, editorFactory: getEditor, crepe } = inject(editorInfoCtxKey, {} as EditorInfoCtx)

  onMounted(() => {
    if (!dom.value)
      return

    const editor = getEditor.value!(dom.value)
    if (!editor)
      return

    loading.value = true

    if (editor instanceof Crepe) {
      crepe.value = editor
      editor
        .create()
        .then((editor) => {
          editorRef.value = editor
        })
        .finally(() => {
          loading.value = false
        })
        .catch(console.error)
    } else {
      editor
      .create()
      .then((editor) => {
        editorRef.value = editor
      })
      .finally(() => {
        loading.value = false
      })
      .catch(console.error)
    }
  })
  onUnmounted(() => {
    editorRef.value?.destroy()
  })

  return dom
}

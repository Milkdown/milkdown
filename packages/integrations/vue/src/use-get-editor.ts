import type { CrepeBuilder } from '@milkdown/crepe/builder'
import type { Editor } from '@milkdown/kit/core'

import { inject, onMounted, onUnmounted, ref } from 'vue'

import type { EditorInfoCtx } from './types'

import { editorInfoCtxKey } from './consts'

export function useGetEditor() {
  const {
    dom,
    loading,
    editor: editorRef,
    editorFactory: getEditor,
  } = inject(editorInfoCtxKey, {} as EditorInfoCtx)
  const currentEditorRef = ref<Editor | CrepeBuilder>()

  onMounted(() => {
    if (!dom.value) return

    const editor = getEditor.value!(dom.value)
    if (!editor) return

    loading.value = true
    currentEditorRef.value = editor
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
    currentEditorRef.value?.destroy().catch(console.error)
  })

  return dom
}

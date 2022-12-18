/* Copyright 2021, Milkdown by Mirone. */
import { inject, onMounted, onUnmounted } from 'vue'

import type { EditorInfoCtx } from './types'
import { editorInfoCtxKey } from '.'

export const useGetEditor = () => {
  const { dom, loading, editor: editorRef, getEditorCallback: getEditor } = inject(editorInfoCtxKey, {} as EditorInfoCtx)

  onMounted(() => {
    if (!dom.value)
      return

    const editor = getEditor.value(dom.value)
    if (!editor)
      return

    loading.value = true

    editor
      .create()
      .then((editor) => {
        editorRef.value = editor
      })
      .finally(() => {
        loading.value = false
      })
      .catch(e => console.error(e))
  })
  onUnmounted(() => {
    editorRef.value?.destroy()
  })

  return dom
}

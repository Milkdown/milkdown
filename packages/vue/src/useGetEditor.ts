/* Copyright 2021, Milkdown by Mirone. */
import { inject, onMounted, onUnmounted, ref } from 'vue'

import type { EditorInfoCtx } from './types'
import { editorInfoCtxKey } from '.'

export const useGetEditor = () => {
  const { dom, loading, editor: editorRef, getEditorCallback: getEditor } = inject(editorInfoCtxKey, {} as EditorInfoCtx)
  const lock = ref(false)

  onMounted(() => {
    if (!dom.value)
      return

    const editor = getEditor.value(dom.value)
    if (!editor)
      return

    if (lock.value)
      return

    loading.value = true
    lock.value = true

    editor
      .create()
      .then((editor) => {
        editorRef.value = editor
      })
      .finally(() => {
        loading.value = false
        lock.value = false
      })
      .catch(e => console.error(e))
  })
  onUnmounted(() => {
    editorRef.value?.destroy()
  })
}

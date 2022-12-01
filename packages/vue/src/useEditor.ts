/* Copyright 2021, Milkdown by Mirone. */

import type { Editor } from '@milkdown/core'
import { ref } from 'vue'

import type { GetEditor, UseEditorReturn } from './types'

export const useEditor = (getEditor: GetEditor): UseEditorReturn => {
  const dom = ref<HTMLDivElement | null>(null)
  const editor = ref<Editor>()
  const loading = ref(true)
  const getEditorCallback = ref<GetEditor>((...args) => getEditor(...args))

  return {
    loading,
    get: () => editor.value,
    editor: {
      getEditorCallback,
      dom,
      editor,
      loading,
    },
  }
}

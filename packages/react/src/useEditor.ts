/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import type { DependencyList } from 'react'
import { useCallback, useRef, useState } from 'react'

import type { GetEditor, UseEditorReturn } from './types'

export const useEditor = (getEditor: GetEditor, deps: DependencyList = []): UseEditorReturn => {
  const dom = useRef<HTMLDivElement | undefined>(undefined)
  const editor = useRef<Editor>()
  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getEditorCallback = useCallback<GetEditor>((...args) => getEditor(...args), deps)

  return {
    loading,
    getInstance: () => editor.current,
    getDom: () => dom.current,
    editor: {
      getEditorCallback,
      dom,
      editor,
      setLoading,
    },
  }
}

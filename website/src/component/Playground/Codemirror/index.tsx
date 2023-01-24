/* Copyright 2021, Milkdown by Mirone. */

import type { MutableRefObject } from 'react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useDarkMode } from '../../../provider/DarkModeProvider'
import { createCodeMirrorState, createCodeMirrorView } from './setup'

export interface CodemirrorProps {
  content: string
  onChange: (getString: () => string) => void
  lock: MutableRefObject<boolean>
}
export interface CodemirrorRef { update: (markdown: string) => void }
export const Codemirror = forwardRef<CodemirrorRef, CodemirrorProps>(({ content, onChange, lock }, ref) => {
  const divRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<ReturnType<typeof createCodeMirrorView>>()
  const dark = useDarkMode()

  useEffect(() => {
    if (!divRef.current)
      return

    const editor = createCodeMirrorView({ root: divRef.current, onChange, lock, content, dark })
    editorRef.current = editor

    return () => {
      editor.destroy()
    }
  }, [onChange, content, lock, dark])

  useImperativeHandle(ref, () => ({
    update: (content: string) => {
      const { current } = editorRef
      if (!current)
        return

      current.setState(createCodeMirrorState({ onChange, lock, dark, content }))
    },
  }))

  return <div className="min-h-full bg-gray-50 dark:bg-gray-900" ref={divRef} />
})
Codemirror.displayName = 'Codemirror'

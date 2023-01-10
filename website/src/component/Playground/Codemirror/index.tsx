/* Copyright 2021, Milkdown by Mirone. */

import type { FC } from 'react'
import React from 'react'
import { useDarkMode } from '../../../provider/DarkModeProvider'
import { createCodeMirrorView } from './setup'

interface CodeMirrorProps {
  content: string
  onChange?: (getString: () => string) => void
  lock?: React.MutableRefObject<boolean>
}
export interface CodeMirrorRef { update: (markdown: string) => void }
export const Codemirror: FC<CodeMirrorProps> = ({ content, onChange, lock }) => {
  const divRef = React.useRef<HTMLDivElement>(null)
  const editorRef = React.useRef<ReturnType<typeof createCodeMirrorView>>()
  const dark = useDarkMode()
  const [focus, setFocus] = React.useState(false)

  // TODO: use focus
  console.warn(focus)

  React.useEffect(() => {
    if (!divRef.current)
      return

    const editor = createCodeMirrorView({ root: divRef.current, onChange, lock, content, dark })
    editorRef.current = editor

    return () => {
      editor.destroy()
    }
  }, [onChange, content, lock, dark])

  return (
    <div
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      ref={divRef}
    />
  )
}

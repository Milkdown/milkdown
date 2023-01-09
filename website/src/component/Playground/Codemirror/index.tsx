/* Copyright 2021, Milkdown by Mirone. */
import './style.css'

import * as Accordion from '@radix-ui/react-accordion'
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
    <>
      <Accordion.Root type="multiple" defaultValue={['markdown']}>
        <Accordion.Item value="markdown">
          <Accordion.Header className="border-nord4 border-b dark:border-gray-600">
            <Accordion.Trigger className="accordion-trigger flex items-center gap-2 px-4 py-2">
              <span className="material-symbols-outlined">expand_more</span>
              <span>
                Markdown
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content forceMount className="accordion-content overflow-hidden transition-all">
            <div
              className="h-full"
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
            >
              <div ref={divRef} />
            </div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="plugins">
          <Accordion.Header className="border-nord4 border-b dark:border-gray-600">
            <Accordion.Trigger className="accordion-trigger flex items-center gap-2 px-4 py-2">
              <span className="material-symbols-outlined">expand_more</span>
              <span>
                Plugins
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>
    </>
  )
}

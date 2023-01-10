/* Copyright 2021, Milkdown by Mirone. */
import './style.css'

import * as Accordion from '@radix-ui/react-accordion'
import type { FC } from 'react'
import React from 'react'
import clsx from 'clsx'
import { useDarkMode } from '../../../provider/DarkModeProvider'
import pkgJson from '../../../../package.json'
import { useLinkClass } from '../../hooks/useLinkClass'
import { createCodeMirrorView } from './setup'
import { AccordionItem } from './AccordionItem'

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
  const linkClass = useLinkClass()

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
    <div className="h-full">
      <div className="border-nord4 flex h-10 items-center justify-between border-b bg-gray-200 px-4 py-2 font-light dark:border-gray-600 dark:bg-gray-500">
        <div>
          <span>
            Milkdown Playground
          </span>
          <span className="ml-2 font-mono text-xs text-gray-600 dark:text-gray-300">
            v{pkgJson.version}
          </span>
        </div>
        <div>
          <button className={clsx(linkClass(false), 'h-6 w-6 rounded-full')}>
            <span className="material-symbols-outlined text-base">share</span>
          </button>
        </div>
      </div>
      <Accordion.Root type="single" defaultValue="markdown" className="h-[calc(100%-2.5rem)]">
        <AccordionItem value="markdown" name="Markdown">
          <div
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            ref={divRef}
          />
        </AccordionItem>
        <AccordionItem value="plugin" name="Plugins">
          TODO: add plugins list here
        </AccordionItem>
        <AccordionItem value="state" name="State">
          TODO: add prosemirror state here
        </AccordionItem>
      </Accordion.Root>
    </div>
  )
}

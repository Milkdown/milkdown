/* Copyright 2021, Milkdown by Mirone. */
import './style.css'

import * as Accordion from '@radix-ui/react-accordion'
import clsx from 'clsx'
import type { FC, RefObject } from 'react'
import { lazy } from 'react'
import pkgJson from '../../../../package.json'
import { useLinkClass } from '../../hooks/useLinkClass'
import type { CodemirrorProps, CodemirrorRef } from '../Codemirror'
import { LazyLoad } from '../../LazyLoad'
import { PluginToggle } from '../PluginToggle'
import { useProseState } from '../Milkdown/ProseStateProvider'
import { useDarkMode } from '../../../provider/DarkModeProvider'
import { useShare } from '../Share/ShareProvider'
import { AccordionItem } from './AccordionItem'

interface ControlPanelProps extends CodemirrorProps {
  codemirrorRef: RefObject<CodemirrorRef>
}

const AsyncCodemirror = lazy(() => import('../Codemirror').then(module => ({ default: module.Codemirror })))
const AsyncJsonViewer = lazy(() => import('@textea/json-viewer').then(module => ({ default: module.JsonViewer })))

export const ControlPanel: FC<ControlPanelProps> = ({ content, onChange, lock, codemirrorRef }) => {
  const linkClass = useLinkClass()
  const proseState = useProseState()
  const darkMode = useDarkMode()
  const share = useShare()

  return (
    <div className="h-full">
      <div className="border-nord4 flex h-10 items-center justify-between border-b bg-gray-200 px-4 py-2 font-light dark:border-gray-600 dark:bg-gray-700">
        <div>
          <span>
            Milkdown Playground
          </span>
          <span className="ml-2 font-mono text-xs text-gray-600 dark:text-gray-300">
            v{pkgJson.version}
          </span>
        </div>
        <div>
          <button onClick={() => share()} className={clsx(linkClass(false), 'flex h-8 w-8 items-center justify-center rounded-full')}>
            <span className="material-symbols-outlined text-base">share</span>
          </button>
        </div>
      </div>
      <Accordion.Root type="single" defaultValue="markdown" className="h-[calc(100%-2.5rem)]">
        <AccordionItem value="markdown" name="Markdown">
          <LazyLoad>
            <AsyncCodemirror ref={codemirrorRef} content={content} onChange={onChange} lock={lock} />
          </LazyLoad>
        </AccordionItem>
        <AccordionItem value="plugin" name="Plugins">
          <PluginToggle />
        </AccordionItem>
        <AccordionItem value="state" name="State">
          <LazyLoad>
            <AsyncJsonViewer defaultInspectDepth={3} value={proseState} theme={darkMode ? 'dark' : 'light'} />
          </LazyLoad>
        </AccordionItem>
      </Accordion.Root>
    </div>

  )
}

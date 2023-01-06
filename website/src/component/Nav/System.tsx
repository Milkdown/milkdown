/* Copyright 2021, Milkdown by Mirone. */
import * as Popover from '@radix-ui/react-popover'
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useSetDarkMode } from '../../provider/DarkModeProvider'
import { useSidePanelState } from '../../provider/SidePanelStateProvider'
import { useLinkClass } from '../hooks/useLinkClass'
import { Languages } from './Languages'

const NavButtonItem: FC<{ children: ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  const linkClass = useLinkClass()
  const className = clsx(
    'mt-1 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full',
    linkClass(false),
  )
  return (
    <div
      onClick={onClick}
      className={className}>
      {children}
    </div>
  )
}

export const System = () => {
  const [languagesOpen, setLanguagesOpen] = useState(false)
  const { mode } = useSidePanelState()
  const container = useRef<HTMLDivElement>(null)
  const setDarkMode = useSetDarkMode()

  useEffect(() => {
    if (docsearch && typeof docsearch === 'function' && container.current) {
      docsearch({
        appId: 'ESBZP4AW9O',

        apiKey: '3c3f00caad4516fb13f96aea068122af',

        indexName: 'milkdown',

        container: container.current,

        debug: true, // Set debug to true if you want to inspect the modal
      })
    }
  }, [])

  return (
    <div className="ml-auto flex select-none md:ml-0 md:block">
      <NavButtonItem>
        <div id="docsearch" ref={container}>search</div>
      </NavButtonItem>
      <Popover.Root open={languagesOpen}>
        <Popover.Trigger onClick={() => setLanguagesOpen(true)}>
          <NavButtonItem>
            <div className="material-symbols-outlined">translate</div>
          </NavButtonItem>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="z-50 ml-2 outline-none" side={mode === 'mobile' ? 'bottom' : 'right'} onInteractOutside={() => setLanguagesOpen(false)}>
            <Languages close={() => setLanguagesOpen(false)} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <a href="https://github.com/Saul-Mirone/milkdown" target="_blank" rel="noreferrer">
        <NavButtonItem>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </NavButtonItem>
      </a>
      <NavButtonItem onClick={() => setDarkMode(x => !x)}>
        <div className="material-symbols-outlined">dark_mode</div>
      </NavButtonItem>
    </div>
  )
}

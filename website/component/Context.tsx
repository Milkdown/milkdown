/* Copyright 2021, Milkdown by Mirone. */
import type {
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
} from 'react'
import { createContext, useMemo, useRef, useState } from 'react'

import type { Local as Localize, Section } from '../route'
import { pageRouter } from '../route'
import { Mode } from './constant'
import { Toast } from './Toast'

type SetState<T> = Dispatch<SetStateAction<T>>

export const displaySidebarCtx = createContext(false)
export const scrolledCtx = createContext(false)
export const editorModeCtx = createContext(Mode.Default)
export const isDarkModeCtx = createContext(false)
export const localCtx = createContext<Localize>('en')
export const sectionsCtx = createContext<Section[]>([])

export const shareCtx = createContext<MutableRefObject<() => void>>({
  current: () => undefined,
})
export const setDisplaySidebarCtx = createContext<SetState<boolean>>(
  () => undefined,
)
export const setScrolledCtx = createContext<SetState<boolean>>(() => undefined)
export const setEditorModeCtx = createContext<SetState<Mode>>(() => undefined)
export const setIsDarkModeCtx = createContext<SetState<boolean>>(
  () => undefined,
)
export const setLocalCtx = createContext<SetState<Localize>>(() => undefined)

const DisplaySidebar: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [displaySidebar, setDisplaySidebar] = useState(false)

  return (
    <displaySidebarCtx.Provider value={displaySidebar}>
      <setDisplaySidebarCtx.Provider value={setDisplaySidebar}>
        {children}
      </setDisplaySidebarCtx.Provider>
    </displaySidebarCtx.Provider>
  )
}

const EditorMode: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [editorMode, setEditorMode] = useState(Mode.Default)

  return (
    <editorModeCtx.Provider value={editorMode}>
      <setEditorModeCtx.Provider value={setEditorMode}>
        {children}
      </setEditorModeCtx.Provider>
    </editorModeCtx.Provider>
  )
}

const Scrolled: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false)

  return (
    <scrolledCtx.Provider value={scrolled}>
      <setScrolledCtx.Provider value={setScrolled}>
        {children}
      </setScrolledCtx.Provider>
    </scrolledCtx.Provider>
  )
}

const IsDarkMode: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  return (
    <isDarkModeCtx.Provider value={isDarkMode}>
      <setIsDarkModeCtx.Provider value={setIsDarkMode}>
        {children}
      </setIsDarkModeCtx.Provider>
    </isDarkModeCtx.Provider>
  )
}

const Local: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [local, setLocal] = useState<Localize>('en')
  const sections = useMemo(() => pageRouter[local], [local])

  return (
    <sectionsCtx.Provider value={sections}>
      <localCtx.Provider value={local}>
        <setLocalCtx.Provider value={setLocal}>{children}</setLocalCtx.Provider>
      </localCtx.Provider>
    </sectionsCtx.Provider>
  )
}

const Share: React.FC<{ children: ReactNode }> = ({ children }) => {
  const shareRef = useRef(() => undefined)

  return <shareCtx.Provider value={shareRef}>{children}</shareCtx.Provider>
}

export const Context: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Toast>
    <Share>
      <Local>
        <IsDarkMode>
          <Scrolled>
            <DisplaySidebar>
              <EditorMode>{children}</EditorMode>
            </DisplaySidebar>
          </Scrolled>
        </IsDarkMode>
      </Local>
    </Share>
  </Toast>
)

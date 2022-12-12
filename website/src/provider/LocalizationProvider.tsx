/* Copyright 2021, Milkdown by Mirone. */

import type { FC, ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import type { Local as Localize, Section } from '../route'
import { i18nConfig, pageRouter } from '../route'
import type { SetState } from '../utils/types'

export const sectionsCtx = createContext<Section[]>([])
export const localCtx = createContext<Localize>('en')
export const setLocalCtx = createContext<SetState<Localize>>(() => undefined)

export const useSetLanguage = (localize: Localize) => {
  const setLocal = useContext(setLocalCtx)

  return setLocal(localize)
}

export const useRootUrl = () => {
  const local = useContext(localCtx)
  return useMemo(() => i18nConfig[local].route, [local])
}

export const usePages = () => {
  const sections = useContext(sectionsCtx)

  return useMemo(() => sections.flatMap(section => section.items), [sections])
}

export const LocalizationProvider: FC<{ children: ReactNode }> = ({ children }) => {
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

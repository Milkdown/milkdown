/* Copyright 2021, Milkdown by Mirone. */

import type { FC, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Local as Localize, Section } from '../route'
import { i18nConfig, pageRouter } from '../route'
import { i18nDict } from '../route/i18n'
import type { SetState } from '../utils/types'

export const sectionsCtx = createContext<Section[]>([])
export const localCtx = createContext<Localize>('en')
export const setLocalCtx = createContext<SetState<Localize>>(() => undefined)

export const useSetLanguage = () => {
  const setLocal = useContext(setLocalCtx)

  return useCallback((localize: Localize) => {
    setLocal(localize)
  }, [setLocal])
}

export const useLocal = () => {
  return useContext(localCtx)
}

export const useRootUrl = () => {
  const local = useContext(localCtx)
  return useMemo(() => i18nConfig[local].route, [local])
}

export const usePages = () => {
  const sections = useContext(sectionsCtx)

  return useMemo(() => sections.flatMap(section => section.items), [sections])
}

export const usePageList = (id?: string) => {
  const sections = useContext(sectionsCtx)
  return useMemo(() => {
    if (!id)
      return undefined

    return sections.find(section => section.id === id)
  }, [id, sections])
}

const getLocalFromUrl = () => {
  const path = window.location.pathname.split('/').filter(x => x.length > 0)
  const [first = ''] = path
  const list = Object.values(i18nConfig)
    .map(({ route }) => route)
    .filter(x => x)
  return list.includes(first) ? (first as Localize) : 'en'
}

export const useI18n = () => {
  const local = useContext(localCtx)
  return useCallback((key: string) => {
    const text = i18nDict.get(key)?.[local]
    if (text)
      return text

    console.warn('Missing i18n key:', key)
    return key
  }, [local])
}

export const LocalizationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [local, setLocal] = useState<Localize>(getLocalFromUrl())
  const sections = useMemo(() => pageRouter[local], [local])

  return (
    <sectionsCtx.Provider value={sections}>
      <localCtx.Provider value={local}>
        <setLocalCtx.Provider value={setLocal}>{children}</setLocalCtx.Provider>
      </localCtx.Provider>
    </sectionsCtx.Provider>
  )
}

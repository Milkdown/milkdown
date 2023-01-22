/* Copyright 2021, Milkdown by Mirone. */

import type { FC, ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { SetState } from '../utils/types'

export const darkModeCtx = createContext<boolean>(false)
export const setDarkModeCtx = createContext<SetState<boolean>>(() => undefined)

export const useDarkMode = () => {
  return useContext(darkModeCtx)
}

export const useSetDarkMode = () => {
  return useContext(setDarkModeCtx)
}

export const DarkModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) => {
      const newColorScheme = !!event.matches

      setDarkMode(newColorScheme)
    }

    media.addEventListener('change', listener)
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])
  return (
    <darkModeCtx.Provider value={darkMode}>
      <setDarkModeCtx.Provider value={setDarkMode}>
        {children}
      </setDarkModeCtx.Provider>
    </darkModeCtx.Provider>
  )
}

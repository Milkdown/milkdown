/* Copyright 2021, Milkdown by Mirone. */
import { useEffect } from 'react'

export const useDarkMode = (isDarkMode: boolean, setIsDarkMode: (isDarkMode: boolean) => void): void => {
  useEffect(() => {
    const darkMode = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    // TODO: remove this line after the dark mode is ready
    // setIsDarkMode(darkMode)
  }, [setIsDarkMode])
}

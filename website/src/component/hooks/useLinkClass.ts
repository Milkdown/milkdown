/* Copyright 2021, Milkdown by Mirone. */
import { clsx } from 'clsx'
import { useCallback } from 'react'

export const useLinkClass = () => {
  return useCallback((isActive: boolean, bg = true) => {
    return clsx(
      bg && (isActive ? 'bg-nord8' : 'hover:bg-gray-300 dark:hover:bg-gray-700'),
      isActive
        ? 'text-gray-900 dark:text-gray-50'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-50')
  }, [])
}

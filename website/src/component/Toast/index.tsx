/* Copyright 2021, Milkdown by Mirone. */
import * as Toast from '@radix-ui/react-toast'
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import './style.css'

type Show = (desc: string, type: 'success' | 'fail' | 'warning') => void
export const setShowCtx = createContext<Show>(() => {})

export const useToast = () => {
  return useContext(setShowCtx)
}

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [desc, setDesc] = useState('')
  const [type, setType] = useState<'success' | 'fail' | 'warning'>('success')

  const show: Show = useCallback((desc: string, type: 'success' | 'fail' | 'warning') => {
    setDesc(desc)
    setType(type)
    setOpen(true)
  }, [])

  const icon = useMemo(() => {
    switch (type) {
      case 'warning':
        return 'report_problem'
      case 'fail':
        return 'error_outline'
      case 'success':
      default:
        return 'check_circle_outline'
    }
  }, [type])

  const iconColor = useMemo(() => {
    switch (type) {
      case 'warning':
        return 'text-nord13'
      case 'fail':
        return 'text-nord11'
      case 'success':
      default:
        return 'text-nord14'
    }
  }, [type])

  return (
    <setShowCtx.Provider value={show}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root className="toast-root" open={open} onOpenChange={setOpen}>
          <Toast.Title className="toast-title">
            <span className={clsx('material-symbols-outlined', iconColor)}>{icon}</span>
            <span className="text-sm font-light">{desc}</span>
          </Toast.Title>
          <Toast.Action className="ToastAction" asChild altText="Close toast.">
            <button className="material-symbols-outlined">close</button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport className="toast-viewport" />
      </Toast.Provider>
    </setShowCtx.Provider>
  )
}

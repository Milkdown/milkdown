/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactNode } from 'react'
import { createContext, useState } from 'react'

import className from './style.module.css'

const icon = `${className.icon} material-icons-outlined`
const closeIcon = `${className.close} ${className.icon} material-icons-outlined`

type ToastType = 'success' | 'warning' | 'error'
type ShoatToast = (type: ToastType, text: string, time?: number) => void

export const showToastCtx = createContext<ShoatToast>(() => undefined)

export const Toast: FC<{ children: ReactNode }> = ({ children }) => {
  const [type, setType] = useState<ToastType>('success')
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const showToast = (type: ToastType, text: string, time = 2000) => {
    setOpen(true)
    setType(type)
    setText(text)
    setTimeout(() => {
      setOpen(false)
    }, time)
  }

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return 'report_problem'
      case 'error':
        return 'error_outline'
      // eslint-disable-next-line default-case-last
      default:
      case 'success':
        return 'check_circle_outline'
    }
  }

  return (
    <showToastCtx.Provider value={showToast}>
      {children}
      <dialog open={open} className={className.toast}>
        <span className={icon}>{getIcon()}</span>
        {text}
        <span className={closeIcon} onClick={() => setOpen(false)}>
          close
        </span>
      </dialog>
    </showToastCtx.Provider>
  )
}

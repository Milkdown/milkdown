/* Copyright 2021, Milkdown by Mirone. */
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

type Json = Record<string, any>

export const proseStateCtx = createContext<Json>({})
export const setProseStateCtx = createContext<Dispatch<SetStateAction<Json>>>(() => {})

export const useProseState = () => useContext(proseStateCtx)

export const useSetProseState = () => useContext(setProseStateCtx)

export const ProseStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [proseState, setProseState] = useState<Json>({})
  return (
    <proseStateCtx.Provider value={proseState}>
      <setProseStateCtx.Provider value={setProseState}>
        {children}
      </setProseStateCtx.Provider>
    </proseStateCtx.Provider>
  )
}

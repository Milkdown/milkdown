/* Copyright 2021, Milkdown by Mirone. */
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

type Json = Record<string, any>

export const ProseStateCtx = createContext<Json>({})
export const SetProseStateCtx = createContext<Dispatch<SetStateAction<Json>>>(() => {})

export const useProseState = () => {
  return useContext(ProseStateCtx)
}

export const useSetProseState = () => {
  return useContext(SetProseStateCtx)
}

export const ProseStateProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [proseState, setProseState] = useState<Json>({})
  return (
    <ProseStateCtx.Provider value={proseState}>
      <SetProseStateCtx.Provider value={setProseState}>
        {children}
      </SetProseStateCtx.Provider>
    </ProseStateCtx.Provider>
  )
}

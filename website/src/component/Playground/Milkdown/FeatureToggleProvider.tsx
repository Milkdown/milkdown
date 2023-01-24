/* Copyright 2021, Milkdown by Mirone. */

import type { FC, ReactNode } from 'react'
import { createContext, useCallback, useContext, useState } from 'react'

type FeatureToggle = {
  enableGFM: boolean
  enableMath: boolean
  enableDiagram: boolean
  enableTwemoji: boolean
  enableBlockHandle: boolean
}

const defaultFeatureToggle: FeatureToggle = {
  enableGFM: true,
  enableMath: true,
  enableDiagram: true,
  enableTwemoji: true,
  enableBlockHandle: true,
}

export const featureToggleCtx = createContext(defaultFeatureToggle)
export const setFeatureToggleCtx = createContext<React.Dispatch<React.SetStateAction<FeatureToggle>>>(() => {})

export const useFeatureToggle = () => useContext(featureToggleCtx)

export const useSetFeatureToggle = () => {
  const setFeatureToggles = useContext(setFeatureToggleCtx)

  return useCallback((config: Partial<FeatureToggle>) => {
    setFeatureToggles(prev => ({ ...prev, ...config }))
  }, [setFeatureToggles])
}

export const FeatureToggleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [featureToggle, setFeatureToggle] = useState(defaultFeatureToggle)

  return (
    <featureToggleCtx.Provider value={featureToggle}>
      <setFeatureToggleCtx.Provider value={setFeatureToggle}>
        {children}
      </setFeatureToggleCtx.Provider>
    </featureToggleCtx.Provider>
  )
}

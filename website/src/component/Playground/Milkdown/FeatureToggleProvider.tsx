/* Copyright 2021, Milkdown by Mirone. */

import type { FC, ReactNode } from 'react'
import { createContext, useCallback, useContext, useState } from 'react'

type FeatureToggle = {
  enableGFM: boolean
  enableMath: boolean
  enableDiagram: boolean
  enableTwemoji: boolean
  enableBlockHandle: boolean
  enableLinkWidget: boolean
}

const defaultFeatureToggle: FeatureToggle = {
  enableGFM: true,
  enableMath: true,
  enableDiagram: true,
  enableTwemoji: true,
  enableBlockHandle: true,
  enableLinkWidget: true,
}

export const FeatureToggleCtx = createContext(defaultFeatureToggle)
export const SetFeatureToggleCtx = createContext<React.Dispatch<React.SetStateAction<FeatureToggle>>>(() => {})

export const useFeatureToggle = () => {
  return useContext(FeatureToggleCtx)
}

export const useSetFeatureToggle = () => {
  const setFeatureToggles = useContext(SetFeatureToggleCtx)

  return useCallback((config: Partial<FeatureToggle>) => {
    setFeatureToggles(prev => ({ ...prev, ...config }))
  }, [setFeatureToggles])
}

export const FeatureToggleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [featureToggle, setFeatureToggle] = useState(defaultFeatureToggle)

  return (
    <FeatureToggleCtx.Provider value={featureToggle}>
      <SetFeatureToggleCtx.Provider value={setFeatureToggle}>
        {children}
      </SetFeatureToggleCtx.Provider>
    </FeatureToggleCtx.Provider>
  )
}

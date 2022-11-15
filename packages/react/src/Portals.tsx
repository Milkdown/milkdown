/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactPortal } from 'react'
import { createContext, memo } from 'react'

import type { RenderReact } from './types'

export const portalContext = createContext<RenderReact>(() => () => {
  throw new Error('out of scope')
})

export const Portals: FC<{ portals: ReactPortal[] }> = memo(({ portals }) => {
  return <>{portals}</>
})

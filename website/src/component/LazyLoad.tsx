/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactNode } from 'react'
import { Suspense } from 'react'

export const LazyLoad: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<div>loading</div>}>
      {children}
    </Suspense>
  )
}

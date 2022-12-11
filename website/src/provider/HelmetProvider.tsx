/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactNode } from 'react'
import { HelmetProvider as Helmet } from 'react-helmet-async'

export const HelmetProvider: FC<{ children: ReactNode }> = ({ children }) => (
  <Helmet>
    {children}
  </Helmet>
)

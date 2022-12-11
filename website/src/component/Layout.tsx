/* Copyright 2021, Milkdown by Mirone. */
import type { ComponentType, FC, ReactNode } from 'react'
import { Footer } from './Footer'

export type LayoutProps = {
  Sidebar: ComponentType
  AppBar: ComponentType
  children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ Sidebar, AppBar, children }) => (
  <div className="pt-16">
    <div className="fixed left-0 top-0 bottom-0 w-20">
      <Sidebar />
    </div>
    <div className="fixed top-0 left-0 right-0 h-16 z-50">
      <AppBar />
    </div>
    <div className="xl:mx-80 lg:mx-40 md:mx-24 mx-8">
      {children}
    </div>
    <Footer />
  </div>
)

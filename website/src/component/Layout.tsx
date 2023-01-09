/* Copyright 2021, Milkdown by Mirone. */
import type { ComponentType, FC, ReactNode } from 'react'
import { useHideSidePanel, useSidePanelVisible } from '../provider/SidePanelStateProvider'
import { Footer } from './Footer'

export type LayoutProps = {
  NavBar: ComponentType
  AppBar: ComponentType
  Sidebar: ComponentType
  children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ NavBar, AppBar, Sidebar, children }) => {
  const sidePanelVisible = useSidePanelVisible()
  const hideSidePanel = useHideSidePanel()

  return (
    <div className="dark:bg-nord0 grid min-h-screen grid-rows-1 bg-white text-gray-900 dark:text-gray-50">
      <div className="bg-nord6/70 dark:bg-nord3/70 fixed inset-y-0 left-0 z-40 hidden w-20 backdrop-blur backdrop-saturate-50 md:block">
        <NavBar />
      </div>
      <div className="bg-nord6/70 dark:bg-nord3/70 fixed inset-x-0 top-0 z-40 block h-16 backdrop-blur backdrop-saturate-50 md:hidden">
        <AppBar />
      </div>
      <div className={`bg-nord6/90 dark:bg-nord3/80 fixed inset-y-0 z-30
        w-80
        overflow-auto rounded-r-3xl pt-16
        shadow-lg backdrop-blur backdrop-saturate-50
        transition-all duration-200
        ease-in-out md:pt-0 ${sidePanelVisible ? 'left-0 md:left-20' : '-left-80'}`}>
        <Sidebar />
      </div>

      <div onClick={() => hideSidePanel(0)} className={`bg-nord0/50 fixed inset-0 z-10 backdrop-blur backdrop-saturate-50 ${sidePanelVisible ? 'block md:hidden' : 'hidden'}`} />

      {children}
      <Footer />
    </div>
  )
}

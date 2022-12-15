/* Copyright 2021, Milkdown by Mirone. */
import type { ComponentType, FC, ReactNode } from 'react'
import { useSidePanelVisible } from '../provider/SidePanelStateProvider'
import { Footer } from './Footer'

export type LayoutProps = {
  NavBar: ComponentType
  AppBar: ComponentType
  Sidebar: ComponentType
  children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ NavBar, AppBar, Sidebar, children }) => {
  const sidePanelVisible = useSidePanelVisible()

  return (
    <div className="pt-16">
      <div className="fixed left-0 top-0 bottom-0 w-20 z-50
      bg-nord6/70 backdrop-blur backdrop-saturate-50
      hidden md:block">
        <NavBar />
      </div>
      <div className="fixed top-0 left-0 right-0 h-16 z-50
      bg-nord6/70 backdrop-blur backdrop-saturate-50
      block md:hidden">
        <AppBar />
      </div>
      <div className={`fixed top-0 bottom-0 z-40 w-80
      shadow-lg rounded-tr-3xl rounded-br-3xl
      bg-nord6/90 backdrop-blur backdrop-saturate-50
      pt-16 md:pt-0
      transition-all duration-200 ease-in-out
      ${sidePanelVisible ? 'left-0 md:left-20' : '-left-80'}`}>
        <Sidebar />
      </div>

      <div className="fixed top-0 left-0 right-0 bottom-0 bg-nord0/50 backdrop-blur backdrop-saturate-50 z-10
    block md:hidden" />

      <div className="xl:mx-80 lg:mx-40 md:mx-24 mx-8">
        {children}
      </div>
      <Footer />
    </div>
  )
}

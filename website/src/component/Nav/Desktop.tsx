/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { usePages, useRootUrl } from '../../provider/LocalizationProvider'
import { useHideSidePanel, useShowSectionSidePanel } from '../../provider/SidePanelStateProvider'
import { System } from './System'

const NavItem: FC<{ icon: string; text: string; id?: string; link?: string }> = ({ icon, text, id, link }) => {
  const showSectionSidePanel = useShowSectionSidePanel()
  const hideSidePanel = useHideSidePanel()
  const location = useLocation()
  const pages = usePages()
  const page = pages.find(page => page.link === location.pathname)
  const isActive = location.pathname === link || (id && page?.parentId === id)

  const ContainerComponent: FC<{ children: ReactNode }> = useMemo(() => {
    if (link) {
      const Container: FC<{ children: ReactNode }> = ({ children }) => (
        <NavLink to={link}>
          {children}
        </NavLink>
      )
      return Container
    }

    const onMouseEnter = () => {
      if (!id)
        return
      showSectionSidePanel(id, 'desktop')
    }

    const onMouseLeave = () => {
      if (!id)
        return
      hideSidePanel(500)
    }

    const Container: FC<{ children: ReactNode }> = ({ children }) => {
      return (
        <div
          className={`text-center cursor-pointer ${isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </div>
      )
    }
    return Container
  }, [hideSidePanel, id, isActive, link, showSectionSidePanel])

  return (
    <ContainerComponent>
      <div className={`py-0.5 px-4 flex justify-center rounded-3xl
        ${isActive ? 'bg-nord8' : 'hover:bg-gray-300'}`}>
        <div className="material-symbols-outlined">{icon}</div>
      </div>
      <div className="text-xs font-light">{text}</div>
    </ContainerComponent>
  )
}

export const DesktopNav: FC = () => {
  const root = useRootUrl()
  const playgroundURL = `/${[root, 'playground'].filter(x => x).join('/')}`

  return (
    <nav className="pt-11 pb-14 h-full w-full flex-col justify-between items-center flex">
      <div>
        <div className="cursor-pointer w-14 h-14 mx-auto flex justify-center items-center
          rounded-full shadow-inner
          bg-white border border-gray-300
          hover:border-blue-200 hover:ring-2 hover:ring-nord8">
          <NavLink to={root}>
            <img className="w-9 h-9" src="/milkdown-logo.svg" />
          </NavLink>
        </div>
        <div className="flex gap-4 flex-col mt-8">
          <NavItem icon="apps" text="Recipes" id="recipes" />
          <NavItem icon="design_services" text="Guide" id="guide" />
          <NavItem icon="extension" text="Plugin" id="plugin" />
          <NavItem icon="api" text="API" id="api" />
          <NavItem icon="view_carousel" text="Playground" link={playgroundURL} />
        </div>
      </div>

      <System />
    </nav>
  )
}

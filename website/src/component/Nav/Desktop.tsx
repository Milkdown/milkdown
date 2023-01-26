/* Copyright 2021, Milkdown by Mirone. */
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { usePages, useRootUrl } from '../../provider/LocalizationProvider'
import { useHideSidePanel, useShowSectionSidePanel } from '../../provider/SidePanelStateProvider'
import { useLinkClass } from '../hooks/useLinkClass'
import { System } from './System'

const NavItem: FC<{ icon: string; text: string; id?: string; link?: string }> = ({ icon, text, id, link }) => {
  const showSectionSidePanel = useShowSectionSidePanel()
  const hideSidePanel = useHideSidePanel()
  const location = useLocation()
  const pages = usePages()
  const page = pages.find(page => page.link === location.pathname)
  const isActive = Boolean(location.pathname === link || (id && page?.parentId === id))
  const linkClass = useLinkClass()

  const wrapperClassName = useMemo(
    () => clsx('cursor-pointer text-center', linkClass(isActive, false)),
    [isActive, linkClass],
  )

  const ContainerComponent: FC<{ children: ReactNode }> = useMemo(() => {
    if (link) {
      const Container: FC<{ children: ReactNode }> = ({ children }) => (
        <NavLink
          className={wrapperClassName}
          to={link}>
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
          className={wrapperClassName}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {children}
        </div>
      )
    }
    return Container
  }, [hideSidePanel, id, link, showSectionSidePanel, wrapperClassName])

  return (
    <ContainerComponent>
      <div className={`flex justify-center rounded-3xl py-0.5 px-4
        ${isActive ? 'bg-nord8 dark:bg-nord9' : 'hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
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
    <nav className="flex h-full w-full flex-col items-center justify-between pt-11 pb-14">
      <div>
        <div className="mx-auto flex h-14 w-14 cursor-pointer items-center justify-center
          rounded-full border-2
          border-gray-300 bg-white shadow-inner hover:bg-gray-200 dark:border-gray-600
          dark:bg-gray-800 hover:dark:bg-gray-700">
          <NavLink to={root}>
            <img className="h-9 w-9" src="/milkdown-logo.svg" />
          </NavLink>
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <NavItem icon="design_services" text="Guide" id="guide" />
          <NavItem icon="apps" text="Recipes" id="recipes" />
          <NavItem icon="extension" text="Plugin" id="plugin" />
          <NavItem icon="api" text="API" id="api" />
          <NavItem icon="view_carousel" text="Playground" link={playgroundURL} />
        </div>
      </div>

      <System />
    </nav>
  )
}

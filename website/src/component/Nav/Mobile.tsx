/* Copyright 2021, Milkdown by Mirone. */

import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { useRootUrl } from '../../provider/LocalizationProvider'
import { useHideSidePanel, useShowRootSidePanel, useSidePanelVisible } from '../../provider/SidePanelStateProvider'
import { useLinkClass } from '../hooks/useLinkClass'
import { System } from './System'

export const MobileNav = () => {
  const root = useRootUrl()
  const visible = useSidePanelVisible()
  const hideSidePanel = useHideSidePanel()
  const showRoot = useShowRootSidePanel()
  const linkClass = useLinkClass()

  return (
    <nav className="flex h-full items-center px-1">
      <button className="flex h-12 w-12 items-center justify-center rounded-full hover:bg-gray-300" onClick={visible ? () => hideSidePanel(0) : showRoot}>
        <span className="material-symbols-outlined">menu</span>
      </button>
      <NavLink to={root} className={clsx('flex h-12 items-center justify-center gap-2 rounded-3xl px-4', linkClass(false))}>
        <img className="inline-block h-7 w-7" src="/milkdown-logo.svg" />
        <span>Milkdown</span>
      </NavLink>

      <System />
    </nav>
  )
}

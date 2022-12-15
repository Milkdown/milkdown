/* Copyright 2021, Milkdown by Mirone. */

import { useHideSidePanel, useShowRootSidePanel, useSidePanelVisible } from '../../provider/SidePanelStateProvider'

export const MobileNav = () => {
  const visible = useSidePanelVisible()
  const hideSidePanel = useHideSidePanel()
  const showRoot = useShowRootSidePanel()

  return (
    <nav className="flex h-full items-center px-1">
      <button className="rounded-full w-12 h-12 flex justify-center items-center hover:bg-gray-300" onClick={visible ? () => hideSidePanel(0) : showRoot}>
        <span className="material-symbols-outlined">menu</span>
      </button>
      <button className="h-12 flex justify-center items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-300 px-4 rounded-3xl">
        <img className="w-7 h-7 inline-block" src="/milkdown-logo.svg" />
        <span>Milkdown</span>
      </button>
    </nav>
  )
}

/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'
import { useEffect, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useI18n, usePageList, usePages, useRootUrl } from '../../provider/LocalizationProvider'
import { ROOT, useHideSidePanel, useHoldSidePanel, useShowRootSidePanel, useShowSectionSidePanel, useSidePanelState } from '../../provider/SidePanelStateProvider'
import type { Section } from '../../route'

type SidePanelItem = {
  id: string
  text: string
  link?: string
  onClick?: () => void
  prefixIcon?: string
  suffixIcon?: string
}

type SidePanelGroupProps = {
  title?: string
  items: Array<SidePanelItem>
}

const SidePanelGroup: FC<SidePanelGroupProps> = ({ title, items }) => {
  const pages = usePages()
  const page = pages.find(page => page.link === location.pathname)
  return (
    <div className="text-nord0 my-2">
      {title && <div className="p-4 font-medium text-lg">{title}</div>}
      <ul>
        {
          items.map((item, index) => {
            if (item.link) {
              return (
                <NavLink
                  to={item.link}
                  key={index.toString()}
                  className={({ isActive }) => `p-4 rounded-full cursor-pointer font-light
                  flex items-center justify-between gap-3
                  ${isActive ? 'bg-nord8 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'}`}
                >
                  {item.prefixIcon && item.prefixIcon === '$' ? <span className="w-6" /> : <span className="material-symbols-outlined">{item.prefixIcon}</span>}
                  <span className="flex-1">{item.text}</span>
                  {item.suffixIcon && <span className="material-symbols-outlined">{item.suffixIcon}</span>}
                </NavLink>
              )
            }
            return (
              <div
                key={index.toString()}
                onClick={item.onClick}
                className={`p-4 rounded-full cursor-pointer font-light
                flex items-center justify-between gap-3
                ${page?.parentId === item.id ? 'bg-nord8 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'}`}
              >
                {item.prefixIcon && item.prefixIcon === '$' ? <span className="w-6" /> : <span className="material-symbols-outlined">{item.prefixIcon}</span>}
                <span className="flex-1">{item.text}</span>
                {item.suffixIcon && <span className="material-symbols-outlined">{item.suffixIcon}</span>}
              </div>
            )
          })
        }
      </ul>
    </div>
  )
}

const getRoot = (playgroundURL: string, getI18n: (key: string) => string, showSectionSidePanel: (id: string) => void): SidePanelGroupProps => {
  return {
    items: [
      {
        id: 'recipes',
        text: getI18n('recipes'),
        prefixIcon: 'apps',
        suffixIcon: 'arrow_forward',
        onClick: () => showSectionSidePanel('recipes'),
      },
      {
        id: 'guide',
        text: getI18n('guide'),
        prefixIcon: 'design_services',
        suffixIcon: 'arrow_forward',
        onClick: () => showSectionSidePanel('guide'),
      },
      {
        id: 'plugin',
        text: getI18n('plugin'),
        prefixIcon: 'extension',
        suffixIcon: 'arrow_forward',
        onClick: () => showSectionSidePanel('plugin'),
      },
      {
        id: 'api',
        text: getI18n('api'),
        prefixIcon: 'api',
        suffixIcon: 'arrow_forward',
        onClick: () => showSectionSidePanel('api'),
      },
      {
        id: 'playground',
        text: getI18n('playground'),
        prefixIcon: 'view_carousel',
        link: playgroundURL,
      },
    ],
  }
}

const sectionToGroup = (section?: Section): SidePanelGroupProps => {
  if (!section) {
    return {
      items: [],
    }
  }

  return {
    items: section.items.map((item): SidePanelItem => {
      return {
        id: item.id,
        text: item.title,
        link: item.link,
      }
    }),
  }
}

export const SidePanel: FC = () => {
  const holdSidePanel = useHoldSidePanel()
  const hideSidePanel = useHideSidePanel()
  const showSectionSidePanel = useShowSectionSidePanel()
  const showRootSidePanel = useShowRootSidePanel()
  const { mode, activeId } = useSidePanelState()
  const getI18n = useI18n()
  const isRoot = activeId === ROOT
  const pageList = usePageList(activeId)
  const location = useLocation()
  const root = useRootUrl()
  const playgroundURL = `/${[root, 'playground'].filter(x => x).join('/')}`

  useEffect(() => {
    hideSidePanel(0)
  }, [hideSidePanel, location.pathname])

  const itemsGroup = useMemo(() => isRoot
    ? getRoot(playgroundURL, getI18n, (key: string) => showSectionSidePanel(key, 'mobile'))
    : sectionToGroup(pageList),
  [getI18n, isRoot, pageList, playgroundURL, showSectionSidePanel])

  const events = mode === 'mobile' ? {} : { onMouseEnter: holdSidePanel, onMouseLeave: () => hideSidePanel(500) }

  return (
    <div className="p-3 w-full h-full divide-y" {...events}>
      { mode === 'mobile' && !isRoot && <SidePanelGroup items={[{ id: ROOT, onClick: showRootSidePanel, text: 'back', prefixIcon: 'arrow_back' }]} />}
      <SidePanelGroup {...itemsGroup} />
    </div>
  )
}

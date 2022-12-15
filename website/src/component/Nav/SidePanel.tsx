/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'
import { useI18n, usePageList } from '../../provider/LocalizationProvider'
import { ROOT, useHideSidePanel, useHoldSidePanel, useSidePanelState } from '../../provider/SidePanelStateProvider'
import type { Section } from '../../route'

type SidePanelItem = {
  id: string
  text: string
  link: string
  prefixIcon?: string
  suffixIcon?: string
}

type SidePanelGroupProps = {
  title?: string
  items: Array<SidePanelItem>
}

const SidePanelGroup: FC<SidePanelGroupProps> = ({ title, items }) => {
  return (
    <div className="text-nord0 my-2">
      {title && <div className="p-4 font-medium text-lg">{title}</div>}
      <ul>
        {
          items.map((item, index) => (
            <div key={index.toString()} className="p-4 rounded-full cursor-pointer font-light
            flex items-center justify-between gap-3
            text-gray-600 hover:text-gray-900 hover:bg-gray-300">
              {item.prefixIcon && item.prefixIcon === '$' ? <span className="w-6" /> : <span className="material-symbols-outlined">{item.prefixIcon}</span>}
              <a className="flex-1" href={item.link}>{item.text}</a>
              {item.suffixIcon && <span className="material-symbols-outlined">{item.suffixIcon}</span>}
            </div>
          ))
        }
      </ul>
    </div>
  )
}

const getRoot = (getI18n: (key: string) => string): SidePanelGroupProps => {
  return {
    items: [
      {
        id: 'recipes',
        text: getI18n('recipes'),
        prefixIcon: 'apps',
        suffixIcon: 'arrow_forward',
        link: '',
      },
      {
        id: 'guide',
        text: getI18n('guide'),
        prefixIcon: 'design_services',
        suffixIcon: 'arrow_forward',
        link: '',
      },
      {
        id: 'plugin',
        text: getI18n('plugin'),
        prefixIcon: 'extension',
        suffixIcon: 'arrow_forward',
        link: '',
      },
      {
        id: 'api',
        text: getI18n('api'),
        prefixIcon: 'api',
        suffixIcon: 'arrow_forward',
        link: '',
      },
      {
        id: 'playground',
        text: getI18n('playground'),
        prefixIcon: 'view_carousel',
        link: '',
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
  const { mode, activeId } = useSidePanelState()
  const getI18n = useI18n()
  const isRoot = activeId === ROOT
  const pageList = usePageList(activeId)

  const itemsGroup = isRoot ? getRoot(getI18n) : sectionToGroup(pageList)

  return (
    <div className="p-3 w-full h-full divide-y" onMouseEnter={holdSidePanel} onMouseLeave={hideSidePanel}>
      { mode === 'mobile' && !isRoot && <SidePanelGroup items={[{ id: ROOT, link: '#', text: 'back', prefixIcon: 'arrow_back' }]} />}
      <SidePanelGroup {...itemsGroup} />
    </div>
  )
}

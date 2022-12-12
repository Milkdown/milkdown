/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'

type SidePanelItem = {
  link: string
  text: string
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

const itemsGroup1: SidePanelGroupProps = {
  title: 'Section Header',
  items: [
    {
      link: '#',
      text: 'Label 1',
      prefixIcon: '$',
      suffixIcon: 'arrow_forward',
    },
    {
      link: '#',
      text: 'Label 2',
      prefixIcon: 'apps',
    },
    {
      link: '#',
      text: 'Label 3',
    },
    {
      link: '#',
      text: 'Label 4',
    },
  ],
}

export const SidePanel: FC = () => {
  return (
    <div className="p-3 w-full h-full divide-y">
      <SidePanelGroup items={[{ link: '#', text: 'back', prefixIcon: 'arrow_back' }]} />
      <SidePanelGroup {...itemsGroup1} />
      <SidePanelGroup {...itemsGroup1} />
    </div>
  )
}

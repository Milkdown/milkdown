/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { useRootUrl } from '../../provider/LocalizationProvider'

const LinkGroups: FC<{ title: string; items: Array<{ text: string; link: string }> }> = ({ title, items }) => {
  return (
    <div>
      <div className="mb-5 text-xl">
        {title}
      </div>
      {
        items.map((item, i) => (
          <div key={i.toString()} className="text-nord10 hover:text-nord9 mb-2">
            <a href={item.link}>{item.text}</a>
          </div>
        ))
      }
    </div>
  )
}

const communityGroup = {
  title: 'Community',
  items: [
    {
      text: 'Discord',
      link: 'https://discord.gg/SdMnrSMyBX',
    },
    {
      text: 'Twitter',
      link: 'https://twitter.com/SaulMirone',
    },
    {
      text: 'Github Discussion',
      link: 'TODO',
    },
  ],
}

export const Footer: FC = () => {
  const root = useRootUrl()
  return (
    <footer className="mt-24 self-end bg-gray-200 py-12">
      <div className="mx-8 md:mx-24 lg:mx-40 xl:mx-80">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="hover:ring-nord8 flex h-20 w-20 cursor-pointer items-center
            justify-center rounded-full
            border border-gray-200 bg-white
            shadow-inner hover:border-blue-200 hover:ring-2">
            <NavLink to={root}>
              <img className="h-12 w-12" src="/milkdown-logo.svg" />
            </NavLink>
          </div>
          <LinkGroups {...communityGroup} />
          <LinkGroups {...communityGroup} />
          <LinkGroups {...communityGroup} />
        </div>
        <div className="text-nord2 mt-6 text-sm font-light">
          MIT Licensed | Copyright © 2021-present Mirone ♡ Meo
        </div>
      </div>
    </footer>
  )
}

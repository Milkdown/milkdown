/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { useRootUrl } from '../../provider/LocalizationProvider'

const LinkGroups: FC<{ title: string; items: Array<{ text: string; link: string }> }> = ({ title, items }) => {
  return (
    <div>
      <div className="text-xl mb-5">
        {title}
      </div>
      {
        items.map((item, i) => (
          <div key={i.toString()} className="text-nord10 mb-2 hover:text-nord9">
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
    <footer className="bg-gray-200 py-12 mt-24 self-end">
      <div className="xl:mx-80 lg:mx-40 md:mx-24 mx-8">
        <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
          <div className="cursor-pointer w-20 h-20 flex justify-center items-center
            rounded-full shadow-inner
            bg-white border border-gray-200
            hover:border-blue-200 hover:ring-2 hover:ring-nord8">
            <NavLink to={root}>
              <img className="w-12 h-12" src="/milkdown-logo.svg" />
            </NavLink>
          </div>
          <LinkGroups {...communityGroup} />
          <LinkGroups {...communityGroup} />
          <LinkGroups {...communityGroup} />
        </div>
        <div className="text-sm font-light mt-6 text-nord2">
          MIT Licensed | Copyright © 2021-present Mirone ♡ Meo
        </div>
      </div>
    </footer>
  )
}

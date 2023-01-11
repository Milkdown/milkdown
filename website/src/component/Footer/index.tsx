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
          <div key={i.toString()} className="text-nord10 hover:text-nord8 dark:text-nord9 hover:dark:text-nord7 mb-2">
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
      text: 'Github',
      link: 'https://github.com/Saul-Mirone/milkdown',
    },
  ],
}

const linksGroup = {
  title: 'Links',
  items: [
    {
      text: 'Prosemirror',
      link: 'https://prosemirror.net/',
    },
    {
      text: 'Remark',
      link: 'https://remark.js.org/',
    },
    {
      text: 'Markdown',
      link: 'https://en.wikipedia.org/wiki/Markdown',
    },
  ],
}

const moreGroup = {
  title: 'More',
  items: [
    {
      text: 'License',
      link: 'https://github.com/Saul-Mirone/milkdown/blob/main/LICENSE',
    },
    {
      text: 'Contributors',
      link: 'https://github.com/Saul-Mirone/milkdown/graphs/contributors',
    },
    {
      text: 'Code of Conduct',
      link: 'https://github.com/Saul-Mirone/milkdown/blob/main/CODE_OF_CONDUCT.md',
    },
  ],
}

export const Footer: FC = () => {
  const root = useRootUrl()
  return (
    <footer className="mt-24 self-end bg-gray-200 py-12 dark:bg-gray-700">
      <div className="mx-8 md:mx-24 lg:mx-40 xl:mx-80">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="mr-auto flex h-20 w-20 cursor-pointer items-center justify-center
            rounded-full border-2
            border-gray-300 bg-white shadow-inner hover:bg-gray-200 dark:border-gray-600
            dark:bg-gray-800 hover:dark:bg-gray-700">
            <NavLink to={root}>
              <img className="h-12 w-12" src="/milkdown-logo.svg" />
            </NavLink>
          </div>
          <LinkGroups {...communityGroup} />
          <LinkGroups {...linksGroup} />
          <LinkGroups {...moreGroup} />
        </div>
        <div className="text-nord2 dark:text-nord4 mt-6 text-sm font-light">
          MIT Licensed | Copyright © 2021-present Mirone ♡ Meo
        </div>
      </div>
    </footer>
  )
}

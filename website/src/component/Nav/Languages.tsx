/* Copyright 2021, Milkdown by Mirone. */
import clsx from 'clsx'
import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLocal, useSetLanguage } from '../../provider/LocalizationProvider'
import type { Local } from '../../route'
import { i18nConfig } from '../../route'
import { useLinkClass } from '../hooks/useLinkClass'
import { useRoot } from '../hooks/useRoot'

export const Languages: FC<{ close: () => void }> = ({ close }) => {
  const root = useRoot()
  const lang = useLocal()
  const setLocal = useSetLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const linkClass = useLinkClass()
  const className = (active: boolean) => clsx('cursor-pointer px-4 py-2 first:rounded-t-lg last:rounded-b-lg', linkClass(active))

  return (
    <ul
      className="m-0 rounded-lg border-2 border-gray-50 bg-gray-50 shadow-lg dark:border-gray-800 dark:bg-gray-800"
      onClick={(e) => {
        e.stopPropagation()
        const { target } = e
        if (!(target instanceof HTMLLIElement))
          return
        const { value, route } = target.dataset
        if (!value)
          return

        const path = location.pathname
          .split('/')
          .filter(x => x)
          .filter(x => x !== root)
        setLocal(value as Local)
        const prefix = route
        const next = [prefix, ...path].filter(x => x).join('/')
        navigate(`/${next}`)
        close()
      }}
    >
      {Object.entries(i18nConfig).map(([key, { display, route }]) => (
        <li
          key={key}
          data-value={key}
          data-route={route}
          className={className(key === lang)}
        >
          {display}
        </li>
      ))}
    </ul>
  )
}

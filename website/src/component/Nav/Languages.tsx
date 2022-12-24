/* Copyright 2021, Milkdown by Mirone. */
import type { FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSetLanguage } from '../../provider/LocalizationProvider'
import type { Local } from '../../route'
import { i18nConfig } from '../../route'
import { useRoot } from '../hooks/useRoot'

export const Languages: FC<{ close: () => void }> = ({ close }) => {
  const root = useRoot()
  const setLocal = useSetLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <ul
      className="bg-gray-50 m-0 rounded-lg border-2 border-gray-50 shadow-lg"
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
          className="px-4 py-2 cursor-pointer text-gray-600 hover:bg-gray-300 hover:text-gray-900 first:rounded-t-lg last:rounded-b-lg"
        >
          {display}
        </li>
      ))}
    </ul>
  )
}

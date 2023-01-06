/* Copyright 2021, Milkdown by Mirone. */
import clsx from 'clsx'
import type { FC, ReactNode } from 'react'
import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useLinkClass } from '../hooks/useLinkClass'

type OutlineItem = { text: string; level: number; id: string }

const NestedDiv: FC<{ level: number; children: ReactNode }> = ({ level, children }) => {
  if (level === 0)
    return <>{children}</>

  return (
    <div className="pl-1">
      <NestedDiv level={level - 1}>{children}</NestedDiv>
    </div>
  )
}

export const Outline: FC<{ items: OutlineItem[] }> = ({ items }) => {
  const location = useLocation()
  const linkClass = useLinkClass()
  const getClassName = useCallback((url: string) => clsx('cursor-pointer truncate rounded-3xl p-2 text-sm font-light', linkClass(location.hash === url)), [linkClass, location.hash])
  return (
    <ul className="flex-1 pr-1">
      <div className="text-nord10 mb-2 pl-3">
        <small>On this page</small>
      </div>
      <div className="overflow-y-auto overflow-x-hidden">
        {
          items.filter(item => item.level <= 2).map((item) => {
            const url = `#${item.id}`
            return (
              <a key={item.id} href={url}>
                <div className={getClassName(url)}>
                  <NestedDiv level={item.level}>
                    {item.text}
                  </NestedDiv>
                </div>
              </a>
            )
          })
        }
      </div>
    </ul>
  )
}

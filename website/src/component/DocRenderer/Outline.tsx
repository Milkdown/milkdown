/* Copyright 2021, Milkdown by Mirone. */
import type { FC, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

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
  return (
    <ul className="pr-1 flex-1">
      <div className="mb-2 pl-3 text-nord10">
        <small>On this page</small>
      </div>
      <div className="overflow-y-auto overflow-x-hidden">
        {
          items.filter(item => item.level <= 2).map((item) => {
            const url = `#${item.id}`
            return (
              <a key={item.id} href={url}>
                <div className={`px-2 py-2 text-sm
                  ${location.hash === url ? 'bg-nord8 font-medium' : 'text-gray-600 font-light hover:bg-gray-300 hover:text-gray-900'}
                  rounded-3xl cursor-pointer truncate`}>
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

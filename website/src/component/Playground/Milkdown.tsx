/* Copyright 2021, Milkdown by Mirone. */
import { Milkdown as Editor } from '@milkdown/react'
import type { FC } from 'react'
import { usePlayground } from './usePlayground'

export const Milkdown: FC<{ content: string }> = ({ content }) => {
  usePlayground(content)

  return (
    <div className="relative h-full pt-16">
      <div className="border-nord4 absolute inset-x-0 top-0 h-10 border-b dark:border-gray-600">
        TODO: add command bar
      </div>
      <div className="h-full overflow-auto overscroll-none pl-10">
        <Editor />
      </div>
    </div>
  )
}

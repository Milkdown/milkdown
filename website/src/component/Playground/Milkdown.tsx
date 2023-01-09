/* Copyright 2021, Milkdown by Mirone. */
import { Milkdown as Editor } from '@milkdown/react'
import type { FC } from 'react'
import { usePlayground } from './usePlayground'

export const Milkdown: FC<{ content: string }> = ({ content }) => {
  usePlayground(content)

  return (
    <Editor />
  )
}

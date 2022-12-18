/* Copyright 2021, Milkdown by Mirone. */
import { Milkdown, MilkdownProvider } from '@milkdown/react'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useLocal } from '../../provider/LocalizationProvider'
import type { Local } from '../../route'
import { i18nConfig } from '../../route'
import { usePlayground } from './usePlayground'

const importContent = (local: Local) => {
  const route = i18nConfig[local].route
  const path = ['index', route].filter(x => x).join('.')
  return import(`./content/${path}.md`)
}

const Editor: FC<{ content: string }> = ({ content }) => {
  usePlayground(content)

  return <Milkdown />
}

export const Playground: FC = () => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const local = useLocal()
  useEffect(() => {
    let importing = true

    importContent(local)
      .then((x) => {
        if (importing) {
          setContent(x.default)
          setLoading(false)
        }
      })
      .catch(console.error)

    return () => {
      importing = false
      setLoading(true)
    }
  }, [local])

  return loading || !content
    ? <div>loading...</div>
    : (
      <MilkdownProvider>
        <ProsemirrorAdapterProvider>
          <Editor content={content} />
        </ProsemirrorAdapterProvider>
      </MilkdownProvider>
      )
}

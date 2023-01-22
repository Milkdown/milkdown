/* Copyright 2021, Milkdown by Mirone. */
import { MilkdownProvider } from '@milkdown/react'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import { lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useLocal } from '../../provider/LocalizationProvider'
import type { Local } from '../../route'
import { i18nConfig } from '../../route'
import { LazyLoad } from '../LazyLoad'
import type { CodemirrorRef } from './Codemirror'
import { ControlPanel } from './ControlPanel'
import type { MilkdownRef } from './Milkdown'

const AsyncMilkdown = lazy(() => import('./Milkdown').then(module => ({ default: module.Milkdown })))

const importContent = (local: Local) => {
  const route = i18nConfig[local].route
  const path = ['index', route].filter(x => x).join('.')
  return import(`./content/${path}.md`)
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

  const lockCodemirror = useRef(false)
  const milkdownRef = useRef<MilkdownRef>(null)
  const codemirrorRef = useRef<CodemirrorRef>(null)

  const onMilkdownChange = useCallback((markdown: string) => {
    const lock = lockCodemirror.current
    if (lock)
      return

    const codemirror = codemirrorRef.current
    if (!codemirror)
      return
    codemirror.update(markdown)
  }, [])

  const onCodemirrorChange = useCallback((getCode: () => string) => {
    const { current } = milkdownRef
    if (!current)
      return
    const value = getCode()
    current.update(value)
  }, [])

  return loading || !content
    ? <div>loading...</div>
    : (
      <div className="m-0 mt-16 grid border-b border-gray-300 dark:border-gray-600 md:ml-20 md:mt-0 md:grid-cols-2">
        <MilkdownProvider>
          <ProsemirrorAdapterProvider>
            <div className="h-[calc(50vh-2rem)] overflow-auto overscroll-none md:h-screen">
              <LazyLoad>
                <AsyncMilkdown ref={milkdownRef} content={content} onChange={onMilkdownChange} />
              </LazyLoad>
            </div>
            <div className="h-[calc(50vh-2rem)] overflow-auto overscroll-none border-l border-gray-300 dark:border-gray-600 md:h-screen">
              <ControlPanel codemirrorRef={codemirrorRef} content={content} onChange={onCodemirrorChange} lock={lockCodemirror} />
            </div>
          </ProsemirrorAdapterProvider>
        </MilkdownProvider>
      </div>
      )
}

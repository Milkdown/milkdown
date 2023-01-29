/* Copyright 2021, Milkdown by Mirone. */
import { MilkdownProvider } from '@milkdown/react'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import { lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocal } from '../../provider/LocalizationProvider'
import type { Local } from '../../route'
import { i18nConfig } from '../../route'
import { compose } from '../../utils/compose'
import { LazyLoad } from '../LazyLoad'
import type { CodemirrorRef } from './Codemirror'
import { ControlPanel } from './ControlPanel'
import type { MilkdownRef } from './Milkdown'
import { FeatureToggleProvider } from './Milkdown/FeatureToggleProvider'
import { ProseStateProvider } from './Milkdown/ProseStateProvider'
import { decode } from './Share/share'
import { ShareProvider } from './Share/ShareProvider'

import './style.css'

const AsyncMilkdown = lazy(() => import('./Milkdown').then(module => ({ default: module.Milkdown })))

const importContent = (local: Local) => {
  const route = i18nConfig[local].route
  const path = ['index', route].filter(x => x).join('.')
  return import(`./content/${path}.md`)
}

const Provider = compose(FeatureToggleProvider, MilkdownProvider, ProsemirrorAdapterProvider, ProseStateProvider, ShareProvider)

export const Playground: FC = () => {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const local = useLocal()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const text = searchParams.get('text')
    let importing = true
    if (text) {
      setContent(decode(text))
      setLoading(false)
    }
    else {
      importContent(local)
        .then((x) => {
          if (importing) {
            setContent(x.default)
            setLoading(false)
          }
        })
        .catch(console.error)
    }

    return () => {
      importing = false
      setLoading(true)
    }
  }, [local, searchParams])

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

  return (loading || !content)
    ? <div>loading...</div>
    : (
      <div className="m-0 mt-16 grid border-b border-gray-300 dark:border-gray-600 md:ml-20 md:mt-0 md:grid-cols-2">
        <Provider>
          <div className="h-[calc(50vh-2rem)] overflow-auto overscroll-none md:h-screen">
            <LazyLoad>
              <AsyncMilkdown ref={milkdownRef} content={content} onChange={onMilkdownChange} />
            </LazyLoad>
          </div>
          <div className="h-[calc(50vh-2rem)] overflow-auto overscroll-none border-l border-gray-300 dark:border-gray-600 md:h-screen">
            <ControlPanel codemirrorRef={codemirrorRef} content={content} onChange={onCodemirrorChange} lock={lockCodemirror} />
          </div>
        </Provider>
      </div>
      )
}

/* Copyright 2021, Milkdown by Mirone. */
import React from 'react'
import { useSearchParams } from 'react-router-dom'

import type { Local } from '../../route'
import { i18nConfig } from '../../route'
import { decode } from '../../utils/share'
import { Mode } from '../constant'
import { localCtx } from '../Context'
import type { MilkdownRef } from '../MilkdownEditor/OnlineEditor'
import { OnlineEditor } from '../MilkdownEditor/OnlineEditor'
import type { CodeMirrorRef } from './CodeMirror'
import { CodeMirror } from './CodeMirror'
import className from './style.module.css'

const importDemo = (local: Local) => {
  const route = i18nConfig[local].route
  const path = ['index', route].filter(x => x).join('.')
  return import(`./content/${path}.md`)
}

export const Demo = () => {
  const ref = React.useRef<HTMLDivElement>(null)
  const lockCode = React.useRef(false)
  const milkdownRef = React.useRef<MilkdownRef>(null)
  const codeMirrorRef = React.useRef<CodeMirrorRef>(null)
  const local = React.useContext(localCtx)
  const [md, setMd] = React.useState('')
  const [searchParams] = useSearchParams()

  React.useEffect(() => {
    const text = searchParams.get('text')
    if (text) {
      setMd(decode(text))

      return
    }
    importDemo(local)
      .then((x) => {
        setMd(x.default)
      })
      .catch(console.error)
  }, [local, searchParams])

  const milkdownListener = React.useCallback((markdown: string) => {
    const lock = lockCode.current
    if (lock)
      return

    const { current } = codeMirrorRef
    if (!current)
      return
    current.update(markdown)
  }, [])

  const onCodeChange = React.useCallback((getCode: () => string) => {
    const { current } = milkdownRef
    if (!current)
      return
    const value = getCode()
    current.update(value)
  }, [])

  return !md.length
    ? null
    : (
      <div ref={ref}>
        <div className={className.milk}>
          <OnlineEditor ref={milkdownRef} content={md} onChange={milkdownListener} />
        </div>
        <CodeMirror ref={codeMirrorRef} value={md} onChange={onCodeChange} lock={lockCode} />
      </div>
      )
}

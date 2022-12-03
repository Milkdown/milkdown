/* Copyright 2021, Milkdown by Mirone. */

import { SlashProvider } from '@milkdown/plugin-slash'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import { useEffect, useRef } from 'react'

export const Slash = () => {
  const { view, prevState } = usePluginViewContext()
  const slashProvider = useRef<SlashProvider>()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      slashProvider.current ??= new SlashProvider({
        content: ref.current,
      })
    }

    return () => {
      slashProvider.current?.destroy()
    }
  }, [])

  useEffect(() => {
    slashProvider.current?.update(view, prevState)
  })

  return (
    <div ref={ref}>Slash</div>
  )
}

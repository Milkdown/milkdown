/* Copyright 2021, Milkdown by Mirone. */

import { BlockProvider } from '@milkdown/plugin-block'
import { useInstance } from '@milkdown/react'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import { useEffect, useRef, useState } from 'react'

export const Block = () => {
  const { view } = usePluginViewContext()
  const slashProvider = useRef<BlockProvider>()
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const [loading, get] = useInstance()

  useEffect(() => {
    if (element && !loading) {
      slashProvider.current ??= new BlockProvider({
        ctx: get().ctx,
        content: element,
      })
    }

    return () => {
      slashProvider.current?.destroy()
    }
  }, [loading, get, element])

  useEffect(() => {
    slashProvider.current?.update(view)
  })

  return (
    <div ref={setElement}>Block</div>
  )
}

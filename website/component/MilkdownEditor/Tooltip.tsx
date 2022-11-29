/* Copyright 2021, Milkdown by Mirone. */

import { TooltipProvider } from '@milkdown/plugin-tooltip'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import { useEffect, useRef } from 'react'

export const Tooltip = () => {
  const { view, prevState } = usePluginViewContext()
  const tooltipProvider = useRef<TooltipProvider>()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current)
      tooltipProvider.current ??= new TooltipProvider(ref.current)

    return () => {
      tooltipProvider.current?.destroy()
    }
  }, [])

  useEffect(() => {
    tooltipProvider.current?.update(view, prevState)
  })

  return (
    <div ref={ref}>Tooltip</div>
  )
}

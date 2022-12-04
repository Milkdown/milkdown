/* Copyright 2021, Milkdown by Mirone. */

import { getCellsInColumn, getCellsInRow } from '@milkdown/preset-gfm'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { Decoration } from '@milkdown/prose/view'
import { DecorationSet } from '@milkdown/prose/view'
import { $prose } from '@milkdown/utils'
import type { useWidgetViewFactory } from '@prosemirror-adapter/react'
import { useWidgetViewContext } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import { useMemo } from 'react'

const TableSelectorWidget: FC = () => {
  const { spec } = useWidgetViewContext()
  const type = spec?.type

  const common = 'cursor-pointer absolute bg-blue-200 hover:bg-blue-400'

  const className = useMemo(() => {
    if (type === 'left')
      return 'w-2 h-full -left-3.5 top-0'

    if (type === 'top')
      return 'right-px h-2 left-0 -top-3.5'

    return 'h-3 w-3 -left-4 -top-4 rounded-full'
  }, [type])

  return (
    <div draggable className={[className, common].join(' ')} />
  )
}

export const tableSelectorPlugin = (widgetViewFactory: ReturnType<typeof useWidgetViewFactory>) => $prose(() => {
  const key = new PluginKey('MILKDOWN_TABLE_SELECTOR')
  return new Plugin({
    key,
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr) {
        const decorations: Decoration[] = []

        const leftCells = getCellsInColumn(0, tr.selection)
        if (!leftCells)
          return null
        const topCells = getCellsInRow(0, tr.selection)
        if (!topCells)
          return null

        const createWidget = widgetViewFactory({
          as: 'div',
          component: TableSelectorWidget,
        })

        const [topLeft] = leftCells
        if (!topLeft)
          return null

        decorations.push(createWidget(topLeft.pos + 1, { type: 'top-left' }))
        leftCells.forEach((cell, index) => {
          decorations.push(createWidget(cell.pos + 1, { type: 'left', index }))
        })
        topCells.forEach((cell, index) => {
          decorations.push(createWidget(cell.pos + 1, { type: 'top', index }))
        })

        return DecorationSet.create(tr.doc, decorations)
      },
    },
    props: {
      decorations(state) {
        return key.getState(state)
      },
    },

  })
})

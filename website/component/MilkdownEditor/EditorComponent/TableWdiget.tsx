/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx } from '@milkdown/core'
import { TooltipProvider, tooltipFactory } from '@milkdown/plugin-tooltip'
import { addColAfterCommand, addColBeforeCommand, addRowAfterCommand, addRowBeforeCommand, deleteSelectedCellsCommand, getCellsInColumn, getCellsInRow, moveColCommand, moveRowCommand, selectColCommand, selectRowCommand, selectTableCommand, setAlignCommand } from '@milkdown/preset-gfm'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { CellSelection } from '@milkdown/prose/tables'
import type { Decoration } from '@milkdown/prose/view'
import { DecorationSet } from '@milkdown/prose/view'
import { useInstance } from '@milkdown/react'
import { $ctx, $prose } from '@milkdown/utils'
import type { useWidgetViewFactory } from '@prosemirror-adapter/react'
import { usePluginViewContext, useWidgetViewContext } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import { useEffect, useMemo, useRef } from 'react'

export const tableTooltipCtx = $ctx<TooltipProvider | null, 'tableTooltip'>(null, 'tableTooltip')

export const tableTooltip = tooltipFactory('TABLE')
export const TableTooltip: FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { view, prevState } = usePluginViewContext()
  const tooltipProvider = useRef<TooltipProvider>()
  const [loading, getEditor] = useInstance()

  const isRow = view.state.selection instanceof CellSelection && view.state.selection.isRowSelection()
  const isCol = view.state.selection instanceof CellSelection && view.state.selection.isColSelection()
  const isWholeTable = isRow && isCol
  const isHeading = isRow && view.state.doc.nodeAt((view.state.selection as CellSelection).$headCell.pos)?.type.name === 'table_header'

  useEffect(() => {
    if (ref.current && !loading) {
      if (!tooltipProvider.current) {
        const provider = new TooltipProvider({
          content: ref.current,
          shouldShow: () => {
            return false
          },
        })
        provider.update(view, prevState)

        getEditor().ctx.set(tableTooltipCtx.key, provider)

        tooltipProvider.current = provider
      }
    }

    return () => {
      tooltipProvider.current?.destroy()
    }
  }, [loading])

  return (
    <div className="flex" ref={ref}>
      {
        !isWholeTable && !isHeading && isRow
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return

            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(addRowBeforeCommand.key)
            })
            tooltipProvider.current?.hide()
          }}
        >
          +Row
        </button>
      }
      {
        !isWholeTable && isCol
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return
            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(addColBeforeCommand.key)
            })

            tooltipProvider.current?.hide()
          }}
        >
          +Col
        </button>
      }
      {
        (isWholeTable || !isHeading)
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return

            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(deleteSelectedCellsCommand.key)
            })
            tooltipProvider.current?.hide()
          }}
        >
          Delete
        </button>
      }
      {
        !isWholeTable && isRow
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return

            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(addRowAfterCommand.key)
            })
            tooltipProvider.current?.hide()
          }}
        >
          Row+
        </button>
      }
      {
        !isWholeTable && isCol
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return
            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(addColAfterCommand.key)
            })

            tooltipProvider.current?.hide()
          }}
        >
          Col+
        </button>
      }
      {
        !isWholeTable && isCol
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return
            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(setAlignCommand.key, 'left')
            })
          }}
        >
          Left
        </button>
      }
      {
        !isWholeTable && isCol
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return
            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(setAlignCommand.key, 'center')
            })
          }}
        >
          Center
        </button>
      }
      {
        !isWholeTable && isCol
        && <button
          className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={() => {
            if (loading)
              return
            getEditor().action((ctx) => {
              ctx.get(commandsCtx).call(setAlignCommand.key, 'right')
            })
          }}
        >
          Right
        </button>
      }
    </div>
  )
}

const TableSelectorWidget: FC = () => {
  const { spec } = useWidgetViewContext()
  const type = spec?.type
  const index = spec?.index ?? 0
  const [loading, getEditor] = useInstance()

  const common = 'cursor-pointer absolute bg-blue-200 hover:bg-blue-400'

  const className = useMemo(() => {
    if (type === 'left')
      return 'w-2 h-full -left-3.5 top-0'

    if (type === 'top')
      return 'right-px h-2 left-0 -top-3.5'

    return 'h-3 w-3 -left-4 -top-4 rounded-full'
  }, [type])

  return (
    <div
      draggable={type !== 'top-left'}
      className={[className, common].join(' ')}
      onClick={(e) => {
        e.stopPropagation()
        if (loading)
          return

        getEditor().action((ctx) => {
          const tooltip = ctx.get(tableTooltipCtx.key)
          const rect = (e.target as HTMLElement).getBoundingClientRect()
          tooltip?.getInstance()?.setProps({
            getReferenceClientRect: () => rect,
          })
          tooltip?.show()

          const commands = ctx.get(commandsCtx)

          if (type === 'left')
            commands.call(selectRowCommand.key, index)

          else if (type === 'top')
            commands.call(selectColCommand.key, index)

          else
            commands.call(selectTableCommand.key)
        })
      }}
      onDragStart={(e) => {
        e.stopPropagation()

        const data = { index: spec?.index, type: spec?.type }
        e.dataTransfer.setData('application/milkdown-table-sort', JSON.stringify(data))
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragOver={(e) => {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        if (type === 'top-left')
          return
        const i = spec?.index
        if (loading || i == null)
          return
        const data = e.dataTransfer.getData('application/milkdown-table-sort')
        try {
          const { index, type } = JSON.parse(data)

          getEditor().action((ctx) => {
            const commands = ctx.get(commandsCtx)
            const options = {
              from: Number(index),
              to: i,
            }

            commands.call(type === 'left' ? moveRowCommand.key : moveColCommand.key, options)
          })
        }
        catch {
          // ignore data from other source
        }
      }}
    />
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

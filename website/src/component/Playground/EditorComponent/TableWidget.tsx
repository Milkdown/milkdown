/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx, editorViewCtx } from '@milkdown/core'
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
import { useEffect, useMemo, useRef, useState } from 'react'

export const tableTooltipCtx = $ctx<TooltipProvider | null, 'tableTooltip'>(null, 'tableTooltip')

export const tableTooltip = tooltipFactory('TABLE')
export const TableTooltip: FC = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { view } = usePluginViewContext()
  const tooltipProvider = useRef<TooltipProvider>()
  const [loading, getEditor] = useInstance()

  const isRow = view.state.selection instanceof CellSelection && view.state.selection.isRowSelection()
  const isCol = view.state.selection instanceof CellSelection && view.state.selection.isColSelection()
  const isWholeTable = isRow && isCol
  const isHeading = isRow && view.state.doc.nodeAt((view.state.selection as CellSelection).$headCell.pos)?.type.name === 'table_header'

  useEffect(() => {
    if (ref.current && !loading && !tooltipProvider.current) {
      const provider = new TooltipProvider({
        content: ref.current,
        tippyOptions: {
          zIndex: 30,
        },
        shouldShow: () => {
          return false
        },
      })
      provider.update(getEditor().ctx.get(editorViewCtx))

      getEditor().ctx.set(tableTooltipCtx.key, provider)

      tooltipProvider.current = provider
    }

    return () => {
      tooltipProvider.current?.destroy()
    }
  }, [getEditor, loading])

  return (
    <div>
      <div className="flex" ref={ref}>
        {
        !isWholeTable && !isHeading && isRow
        && <button
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
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
    </div>
  )
}

const TableSelectorWidget: FC = () => {
  const { spec } = useWidgetViewContext()
  const type = spec?.type
  const index = spec?.index ?? 0
  const [loading, getEditor] = useInstance()
  const ref = useRef<HTMLDivElement>(null)

  const [dragOver, setDragOver] = useState(false)

  const common = useMemo(() => ['cursor-pointer absolute bg-blue-200 hover:bg-nord8', dragOver ? 'ring-2' : ''].join(' '), [dragOver])

  const className = useMemo(() => {
    if (type === 'left')
      return 'w-2 h-full -left-3.5 top-0'

    if (type === 'top')
      return 'right-px h-2 left-0 -top-3.5'

    return 'h-3 w-3 -left-4 -top-4 rounded-full'
  }, [type])

  return (
    <div
      ref={ref}
      draggable={type !== 'top-left'}
      className={[className, common].join(' ')}
      onClick={(e) => {
        e.stopPropagation()
        const div = ref.current
        if (loading || !div)
          return

        getEditor().action((ctx) => {
          const tooltip = ctx.get(tableTooltipCtx.key)
          tooltip?.getInstance()?.setProps({
            getReferenceClientRect: () => {
              return div.getBoundingClientRect()
            },
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
        setDragOver(true)
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDragLeave={() => {
        setDragOver(false)
      }}
      onDrop={(e) => {
        setDragOver(false)
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
        return {
          decorations: DecorationSet.empty,
          pos: 0,
        }
      },
      apply(tr, value: { decorations: DecorationSet; pos: number }, oldState, newState) {
        const leftCells = getCellsInColumn(0, tr.selection)
        if (!leftCells)
          return { decorations: DecorationSet.empty, pos: 0 }
        const topCells = getCellsInRow(0, tr.selection)
        if (!topCells)
          return { decorations: DecorationSet.empty, pos: 0 }

        const createWidget = widgetViewFactory({
          as: 'div',
          component: TableSelectorWidget,
        })

        const [topLeft] = leftCells
        if (!topLeft)
          return { decorations: DecorationSet.empty, pos: 0 }

        const decorations: Decoration[] = []
        decorations.push(createWidget(topLeft.pos + 1, { type: 'top-left' }))
        leftCells.forEach((cell, index) => {
          decorations.push(createWidget(cell.pos + 1, { type: 'left', index }))
        })
        topCells.forEach((cell, index) => {
          decorations.push(createWidget(cell.pos + 1, { type: 'top', index }))
        })

        if (value.pos === topLeft.pos && oldState.doc.eq(newState.doc))
          return value

        return {
          decorations: DecorationSet.create(tr.doc, decorations),
          pos: topLeft.pos,
        }
      },
    },
    props: {
      decorations(state) {
        return key.getState(state).decorations
      },
    },
  })
})

import type { Ctx } from '@milkdown/ctx'

import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'

import { withMeta } from '../__internal__/with-meta'
import {
  dropIndicatorConfig,
  dropIndicatorState,
  type DropIndicatorState,
} from './state'

const key = new PluginKey('MILKDOWN_DROP_INDICATOR_DOM')

/// The drop indicator DOM plugin to render the drop indicator as a DOM element.
export const dropIndicatorDOMPlugin = $prose(
  (ctx: Ctx) =>
    new Plugin({
      key,
      view: (view) => {
        const config = ctx.get(dropIndicatorConfig.key)
        const dom = document.createElement('div')
        Object.assign(dom.style, {
          position: 'fixed',
          pointerEvents: 'none',
          display: 'none',
          backgroundColor: config.color,
          top: '0',
          left: '0',
        })
        dom.classList.add(config.class)
        dom.classList.add('milkdown-drop-indicator')

        view.dom.parentNode?.appendChild(dom)
        const stateSlice = ctx.use(dropIndicatorState.key)

        const onUpdate = (state: DropIndicatorState) => {
          renderIndicator(dom, state, config)
        }

        stateSlice.on(onUpdate)

        return {
          destroy: () => {
            stateSlice.off(onUpdate)
            dom.remove()
          },
        }
      },
    })
)

withMeta(dropIndicatorDOMPlugin, {
  displayName: 'Prose<dropIndicatorDOM>',
})

function renderIndicator(
  dom: HTMLDivElement,
  state: DropIndicatorState,
  config: dropIndicatorConfig
) {
  if (!state) {
    Object.assign(dom.style, { display: 'none' })
    return
  }

  const { line } = state
  const { width: lineWidth } = config

  const {
    p1: { x: x1, y: y1 },
    p2: { x: x2, y: y2 },
  } = line
  const horizontal = y1 === y2

  let width: number
  let height: number
  let top: number = y1
  let left: number = x1

  if (horizontal) {
    width = x2 - x1
    height = lineWidth
    top -= lineWidth / 2
  } else {
    width = lineWidth
    height = y2 - y1
    left -= lineWidth / 2
  }

  top = Math.round(top)
  left = Math.round(left)

  Object.assign(dom.style, {
    display: 'block',
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${left}px, ${top}px)`,
  })
}

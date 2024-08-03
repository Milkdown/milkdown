import type { Component } from 'atomico'
import { c, html, useCallback, useEffect, useHost, useMemo, useRef, useState } from 'atomico'
import type { Ctx } from '@milkdown/kit/ctx'
import type { BlockEditFeatureConfig } from '../index'
import { getGroups } from './config'

export interface MenuProps {
  ctx: Ctx
  show: boolean
  filter: string
  hide: () => void
  config?: BlockEditFeatureConfig
}

export const menuComponent: Component<MenuProps> = ({
  show,
  hide,
  ctx,
  filter,
  config,
}) => {
  const { groups, size } = useMemo(() => getGroups(filter, config), [filter])

  const host = useHost()
  const [hoverIndex, setHoverIndex] = useState(0)

  const root = useMemo(() => host.current.getRootNode() as HTMLElement, [host])

  const prevMousePosition = useRef({ x: -999, y: -999 })

  const onMouseMove = useCallback((e: MouseEvent) => {
    const prevPos = prevMousePosition.current
    if (!prevPos)
      return

    const { x, y } = e
    prevPos.x = x
    prevPos.y = y
  }, [])

  useEffect(() => {
    if (size === 0 && show)
      hide?.()
  }, [size, show])

  const onHover = useCallback((
    index: number | ((prev: number) => number),
    after?: (index: number) => void,
  ) => {
    setHoverIndex((prev) => {
      const next = typeof index === 'function' ? index(prev) : index

      after?.(next)
      return next
    })
  }, [])

  const scrollToIndex = useCallback((index: number) => {
    const target = host
      .current
      .querySelector<HTMLElement>(`[data-index="${index}"]`)
    const scrollRoot = host.current.querySelector<HTMLElement>('.menu-groups')

    if (!target || !scrollRoot)
      return

    scrollRoot.scrollTop = target.offsetTop - scrollRoot.offsetTop
  }, [])

  const runByIndex = useCallback((index: number) => {
    const item = groups.flatMap(group => group.items).at(index)
    if (item && ctx)
      item.onRun(ctx)

    hide?.()
  }, [groups])

  const onKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      hide?.()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      return onHover(index => (index < size - 1) ? index + 1 : index, scrollToIndex)
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      return onHover(index => index <= 0 ? index : index - 1, scrollToIndex)
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      return onHover((index) => {
        const group = groups.find(group => group.range[0] <= index && group.range[1] > index)
        if (!group)
          return index

        const prevGroup = groups[groups.indexOf(group) - 1]
        if (!prevGroup)
          return index

        return prevGroup.range[1] - 1
      }, scrollToIndex)
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      return onHover((index) => {
        const group = groups.find(group => group.range[0] <= index && group.range[1] > index)
        if (!group)
          return index

        const nextGroup = groups[groups.indexOf(group) + 1]
        if (!nextGroup)
          return index

        return nextGroup.range[0]
      }, scrollToIndex)
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      runByIndex(hoverIndex)
    }
  }, [hide, groups, hoverIndex])

  const onMouseEnter = useCallback((index: number) => {
    return (e: MouseEvent) => {
      const prevPos = prevMousePosition.current
      if (!prevPos)
        return

      const { x, y } = e
      if (x === prevPos.x && y === prevPos.y)
        return

      onHover(index)
    }
  }, [])

  useEffect(() => {
    if (show)
      root.addEventListener('keydown', onKeydown, { capture: true })

    else root.removeEventListener('keydown', onKeydown, { capture: true })

    return () => {
      root.removeEventListener('keydown', onKeydown, { capture: true })
    }
  }, [show, onKeydown])

  return html`
    <host onmousedown=${(e: MouseEvent) => e.preventDefault()}>
      <nav class="tab-group">
        <ul>
          ${groups.map(group =>
            html`<li
              key=${group.key}
              onmousedown=${() => onHover(group.range[0], scrollToIndex)}
              class=${hoverIndex >= group.range[0] && hoverIndex < group.range[1] ? 'selected' : ''}
            >
              ${group.label}
            </li>`)}
        </ul>
      </nav>
      <div class="menu-groups" onmousemove=${onMouseMove}>
        ${groups.map((group) => {
          return html`
            <div key=${group.key} class="menu-group">
              <h6>${group.label}</h6>
              <ul>
                ${group.items.map(item =>
                  html`<li
                    key=${item.key}
                    data-index=${item.index}
                    class=${hoverIndex === item.index ? 'hover' : ''}
                    onmouseenter=${onMouseEnter(item.index)}
                    onmousedown=${() => {
                      host
                        .current
                        .querySelector(`[data-index="${item.index}"]`)
                        ?.classList.add('active')
                    }}
                    onmouseup=${() => {
                      host
                        .current
                        .querySelector(`[data-index="${item.index}"]`)
                        ?.classList.remove('active')
                      runByIndex(item.index)
                    }}
                  >
                    ${item.icon}
                    <span>${item.label}</span>
                  </li>`,
                )}
              </ul>
            </div>
          `
        })}
      </div>
    </host>
  `
}

menuComponent.props = {
  ctx: Object,
  config: Object,
  show: Boolean,
  filter: String,
  hide: Function,
}

export const MenuElement = c(menuComponent)

import type { Component } from 'atomico'
import { c, html, useHost, useLayoutEffect, useRef } from 'atomico'
import { useCssLightDom } from '@atomico/hooks/use-css-light-dom'
import clsx from 'clsx'
import type { ListItemBlockConfig } from './config'
import { style } from './style'

interface Attrs {
  label: string
  checked: boolean
  listType: string
}

export type ListItemComponentProps = Attrs & {
  config: ListItemBlockConfig
  selected: boolean
  setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void
  onMount: () => void
}

export const listItemComponent: Component<ListItemComponentProps> = ({
  selected,
  label,
  listType,
  checked,
  onMount,
  setAttr,
  config,
}) => {
  const host = useHost()
  const contentWrapperRef = useRef<HTMLDivElement>()
  useCssLightDom(style)

  useLayoutEffect(() => {
    const current = contentWrapperRef.current
    if (!current)
      return

    const contentDOM = host.current.querySelector('[data-content-dom]')

    if (contentDOM) {
      current.appendChild(contentDOM)
      onMount?.()
    }
  }, [])

  const onClickLabel = () => {
    if (checked == null)
      return

    setAttr?.('checked', !checked)
  }

  return html`<host>
    <li class=${clsx('list-item', selected && 'ProseMirror-selectednode')}>
      <div class="label-wrapper" onclick=${onClickLabel} contenteditable="false">${config?.renderLabel(label ?? '', listType ?? '', checked)}</div>
      <div class="children" ref=${contentWrapperRef}></div>
    </li>
  </host>`
}

listItemComponent.props = {
  label: String,
  checked: Boolean,
  listType: String,
  config: Object,
  selected: Boolean,
  setAttr: Function,
  onMount: Function,
}

export const ListItemElement = c(listItemComponent)

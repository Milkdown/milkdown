import type { Component } from 'atomico'
import { c, html, useHost, useLayoutEffect, useRef } from 'atomico'
import type { ListItemBlockConfig } from './config'

interface Attrs {
  label: string
  checked: boolean
  listType: string
}

export type ListItemComponentProps = Attrs & {
  config: ListItemBlockConfig
  readonly: boolean
  selected: boolean
  setAttr: <T extends keyof Attrs>(attr: T, value: Attrs[T]) => void
  onMount: () => void
}

export const listItemComponent: Component<ListItemComponentProps> = ({
  selected,
  label = '',
  listType = '',
  checked,
  onMount,
  setAttr,
  config,
  readonly,
}) => {
  const host = useHost()
  const contentWrapperRef = useRef<HTMLDivElement>()

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

  const labelProps = {
    label,
    listType,
    checked,
    readonly,
  }

  return html`<host class=${selected && 'ProseMirror-selectednode'}>
    <li class='list-item'>
      <div class="label-wrapper" onclick=${onClickLabel} contenteditable="false">
        ${config?.renderLabel(labelProps)}
      </div>
      <div class="children" ref=${contentWrapperRef}></div>
    </li>
  </host>`
}

listItemComponent.props = {
  label: String,
  checked: Boolean,
  readonly: Boolean,
  listType: String,
  config: Object,
  selected: Boolean,
  setAttr: Function,
  onMount: Function,
}

export const ListItemElement = c(listItemComponent)

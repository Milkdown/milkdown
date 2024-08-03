import { type Component, c, html, useEffect, useRef } from 'atomico'
import { menuIcon, plusIcon } from '../../../icons'
import type { Icon } from '../../shared'

export interface BlockHandleProps {
  show: boolean
  onAdd: () => void
  addIcon: Icon
  handleIcon: Icon
}

const blockHandleComponent: Component<BlockHandleProps> = ({
  onAdd,
  addIcon,
  handleIcon,
}) => {
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    ref.current?.classList.remove('active')
  })
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    ref.current?.classList.add('active')
  }
  const onMouseUp = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onAdd?.()
    ref.current?.classList.remove('active')
  }
  return html`
    <host>
      <div ref=${ref} onmousedown=${onMouseDown} onmouseup=${onMouseUp} class="operation-item">
        ${addIcon?.() || plusIcon}
      </div>
      <div class="operation-item">
        ${handleIcon?.() || menuIcon}
      </div>
    </host>
  `
}

blockHandleComponent.props = {
  show: Boolean,
  onAdd: Function,
  addIcon: Function,
  handleIcon: Function,
}

export const BlockHandleElement = c(blockHandleComponent)

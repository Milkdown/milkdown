import { type Component, c, html, useEffect, useRef } from 'atomico'
import { menuIcon, plusIcon } from '../../../icons'

export interface BlockHandleProps {
  show: boolean
  onAdd: () => void
}

const blockHandleComponent: Component<BlockHandleProps> = ({ onAdd }) => {
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
        ${plusIcon}
      </div>
      <div class="operation-item">
        ${menuIcon}
      </div>
    </host>
  `
}

blockHandleComponent.props = {
  show: Boolean,
  onAdd: Function,
}

export const BlockHandleElement = c(blockHandleComponent)

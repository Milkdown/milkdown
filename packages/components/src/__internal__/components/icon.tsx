import clsx from 'clsx'
import DOMPurify from 'dompurify'
import { h } from 'vue'

h

type IconProps = {
  icon?: string | null
  class?: string
  onClick?: (event: PointerEvent) => void
}

export function Icon({ icon, class: className, onClick }: IconProps) {
  return (
    <span
      class={clsx('milkdown-icon', className)}
      onPointerdown={onClick}
      ref={(el) => {
        if (el && icon) {
          ;(el as HTMLElement).innerHTML = DOMPurify.sanitize(icon.trim())
        }
      }}
    />
  )
}

Icon.props = {
  icon: {
    type: String,
    required: false,
  },
  class: {
    type: String,
    required: false,
  },
  onClick: {
    type: Function,
    required: false,
  },
}

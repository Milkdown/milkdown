import clsx from 'clsx'
import DOMPurify from 'dompurify'
import { h } from 'vue'

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
      innerHTML={icon ? DOMPurify.sanitize(icon.trim()): undefined}
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

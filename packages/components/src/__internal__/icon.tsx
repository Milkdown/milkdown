import clsx from 'clsx'
import { h } from 'vue'

h

type IconProps = {
  icon: string | null
  class?: string
}

export function Icon({ icon, class: className }: IconProps) {
  return (
    <span
      class={clsx('milkdown-icon', className)}
      ref={(el) => {
        if (el && icon) {
          ;(el as HTMLElement).innerHTML = icon
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
}

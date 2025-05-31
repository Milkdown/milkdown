import type { EditorView } from '@milkdown/kit/prose/view'

import { Icon } from '@milkdown/kit/component'
import { defineComponent, type ShallowRef, type VNodeRef, h } from 'vue'

import type { LatexConfig } from '..'

type LatexTooltipProps = {
  config: Partial<LatexConfig>
  innerView: ShallowRef<EditorView | null>
  updateValue: ShallowRef<() => void>
}

h

export const LatexTooltip = defineComponent<LatexTooltipProps>({
  props: {
    config: {
      type: Object,
      required: true,
    },
    innerView: {
      type: Object,
      required: true,
    },
    updateValue: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const innerViewRef: VNodeRef = (el) => {
      if (!el || !(el instanceof HTMLElement)) return
      while (el.firstChild) {
        el.removeChild(el.firstChild)
      }
      if (props.innerView.value) {
        el.appendChild(props.innerView.value.dom)
      }
    }
    const onUpdate = (e: Event) => {
      e.preventDefault()
      props.updateValue.value()
    }

    return () => {
      return (
        <div class="container">
          {props.innerView && <div ref={innerViewRef} />}
          <button onPointerdown={onUpdate}>
            <Icon icon={props.config.inlineEditConfirm} />
          </button>
        </div>
      )
    }
  },
})

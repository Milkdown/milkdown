import { c, h, html, type Component } from 'atomico'
import type { LatexConfig } from '..'
import type { EditorView } from '@milkdown/kit/prose/view'

type LatexEditComponentProps = {
  config: Partial<LatexConfig>
  innerView: EditorView
  updateValue: () => void
}

export const latexEditComponent: Component<LatexEditComponentProps> = ({
  config,
  innerView,
  updateValue,
}) => {
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    updateValue?.()
  }
  return html`
    <host>
      <div class="container">
        ${innerView && h(innerView.dom, {})}
        <button onmousedown=${onMouseDown}>
          ${config?.inlineEditConfirm?.()}
        </button>
      </div>
    </host>
  `
}

latexEditComponent.props = {
  config: Object,
  innerView: Object,
  updateValue: Function,
}

export const LatexInlineEditElement = c(latexEditComponent)

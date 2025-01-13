import { c, html, type Component } from 'atomico'

export const latexEditComponent: Component = () => {
  return html`
    <host>
      <div>
        inline latex editor
      </div>
    </host>
  `
}

latexEditComponent.props = {
}

export const LatexInlineEditElement = c(latexEditComponent)

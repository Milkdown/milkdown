import nordStyle from '@milkdown/theme-nord/style.css?inline'
import pmStyle from '@milkdown/kit/prose/view/style/prosemirror.css?inline'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/kit/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { history } from '@milkdown/kit/plugin/history'
import commonStyle from './style.css?inline'

export function wrapInShadow(styles: string[]) {
  const root = document.createElement('div')
  const shadow = root.attachShadow({ mode: 'open' })
  const sheets = styles.map((style) => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(style)
    return sheet
  })
  shadow.adoptedStyleSheets = sheets
  root.appendChild(shadow)
  const wrapper = document.createElement('div')
  shadow.appendChild(wrapper)
  return {
    wrapper,
    root,
  }
}

export function wrapInShadowWithNord(styles: string[]) {
  return wrapInShadow([nordStyle, pmStyle, commonStyle, ...styles])
}

export interface CommonArgs {
  readonly: boolean
  instance: Editor
  enableInspector?: boolean
  defaultValue?: string
}
export function setupMilkdown(
  styles: string[],
  args: CommonArgs,
  setup?: (editor: Editor, root: HTMLElement, wrapper: HTMLElement) => void,
) {
  const { wrapper, root } = wrapInShadowWithNord(styles)
  wrapper.classList.add('milkdown-storybook')
  const editor = Editor.make()
    .enableInspector(args.enableInspector ?? false)
    .config((ctx) => {
      ctx.set(rootCtx, wrapper)
      ctx.set(defaultValueCtx, args.defaultValue ?? '')
      ctx.set(editorViewOptionsCtx, {
        editable: () => !args.readonly,
      })
    })
    .config(nord)
    .use(commonmark)
    .use(history)

  setup?.(editor, root, wrapper)

  editor.create()
    .then(() => {
      args.instance = editor
    })

  return root
}

import nordStyle from '@milkdown/theme-nord/style.css?inline'
import pmStyle from '@milkdown/kit/prose/view/style/prosemirror.css?inline'
import {
  Editor,
  defaultValueCtx,
  editorViewOptionsCtx,
  rootCtx,
} from '@milkdown/kit/core'
import { nord } from '@milkdown/theme-nord'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { history } from '@milkdown/kit/plugin/history'
import commonStyle from './style.css?inline'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { codeToHtml } from 'shiki'

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
    shadow,
  }
}

export function wrapInShadowWithNord(styles: string[]) {
  return wrapInShadow([nordStyle, pmStyle, commonStyle, ...styles])
}

let running = false
export function injectMarkdown(
  markdown: string,
  markdownContainer: HTMLElement
) {
  if (running) return
  running = true
  codeToHtml(markdown, {
    lang: 'markdown',
    theme: 'vitesse-light',
  })
    .then((html) => {
      markdownContainer.innerHTML = html
    })
    .finally(() => {
      running = false
    })
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
  setup?: (editor: Editor, root: HTMLElement, wrapper: HTMLElement) => void
) {
  const { wrapper, root, shadow } = wrapInShadowWithNord(styles)
  wrapper.classList.add('milkdown-storybook')
  const markdownContainer = document.createElement('div')
  markdownContainer.classList.add('markdown-container')
  shadow.appendChild(markdownContainer)

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
    .config((ctx) => {
      const listenerAPI = ctx.get(listenerCtx)
      if (args.defaultValue) {
        injectMarkdown(args.defaultValue, markdownContainer)
      }

      listenerAPI.markdownUpdated((_, markdown) => {
        injectMarkdown(markdown, markdownContainer)
      })
    })
    .use(listener)
    .use(commonmark)
    .use(history)

  setup?.(editor, root, wrapper)

  editor.create().then(() => {
    args.instance = editor
  })

  return root
}

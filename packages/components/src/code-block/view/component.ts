/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView as CodeMirror } from '@codemirror/view'
import type { Component } from 'atomico'
import { html, useEffect, useRef } from 'atomico'
import { useCssLightDom } from '@atomico/hooks/use-css-light-dom'
import { style } from './style'

export type CodeComponentProps = {
  codemirror: CodeMirror
}

export const codeComponent: Component<CodeComponentProps> = ({ codemirror }) => {
  const codemirrorHostRef = useRef<HTMLDivElement>()
  useCssLightDom(style)
  useEffect(() => {
    if (codemirrorHostRef.current && codemirror)
      codemirrorHostRef.current.appendChild(codemirror.dom)
  }, [])
  return html`<host>
    <div class="tools">Tools</div>
    <div ref=${codemirrorHostRef} class="codemirror-host"></div>
  </host>`
}

codeComponent.props = {
  codemirror: Object,
}

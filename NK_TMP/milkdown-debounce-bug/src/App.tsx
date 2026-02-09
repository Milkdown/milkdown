import { useRef } from 'react'
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { commonmark } from '@milkdown/preset-commonmark'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'

// Note: theme-nord is intentionally NOT used here because its CSS import chain
// requires @milkdown/prose/view/style/prosemirror.css from a built lib/ directory.
// The editor renders fine without theming for bug reproduction purposes.

function MilkdownEditor() {
  const countRef = useRef(0)
  const spanRef = useRef<HTMLSpanElement>(null)

  useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, '# Hello\n\nType here to test debounce.')

        const l = ctx.get(listenerCtx)
        l.markdownUpdated((_ctx, _markdown, _prevMarkdown) => {
          countRef.current += 1
          if (spanRef.current) {
            spanRef.current.textContent = String(countRef.current)
          }
          // eslint-disable-next-line no-console
          console.log(`[markdownUpdated] count=${countRef.current}`)
        })
      })
      .use(commonmark)
      .use(listener)
  })

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <strong>markdownUpdated callback count: </strong>
        <span id="callback-count" ref={spanRef}>0</span>
      </div>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Type rapidly in the editor below. With the debounce bug, the callback
        count will be ~1 per keystroke instead of ~1 per debounce window.
      </p>
      <Milkdown />
    </div>
  )
}

function App() {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  )
}

export default App

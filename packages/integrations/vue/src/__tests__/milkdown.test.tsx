import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { render, screen, waitFor } from '@testing-library/vue'
import { expect, test } from 'vitest'
import { defineComponent } from 'vue'

import { Milkdown, MilkdownProvider } from '../editor'
import { useEditor } from '../use-editor'

const TestEditor = defineComponent({
  setup() {
    useEditor((root) => {
      const milkdown = Editor.make()

      milkdown
        .config((ctx) => {
          ctx.set(rootCtx, root)
          ctx.set(defaultValueCtx, '# Testing')
        })
        .use(commonmark)

      return milkdown
    })

    return () => <Milkdown />
  },
})

const TestApp = defineComponent({
  setup() {
    return () => (
      <MilkdownProvider>
        <TestEditor />
      </MilkdownProvider>
    )
  },
})

test('should render milkdown', async () => {
  render(<TestApp />)

  await waitFor(() => {
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })
})

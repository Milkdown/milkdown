import { defaultValueCtx, Editor, rootCtx } from '@milkdown/kit/core'
import { commonmark } from '@milkdown/kit/preset/commonmark'
import { render, screen, waitFor } from '@testing-library/react'
import React, { type FC } from 'react'
import { expect, test } from 'vitest'

import { Milkdown, MilkdownProvider } from '../editor'
import { useEditor } from '../use-editor'

const TestEditor: FC = () => {
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

  return <Milkdown />
}

const TestApp = () => {
  return (
    <MilkdownProvider>
      <TestEditor />
    </MilkdownProvider>
  )
}

test('should render milkdown', async () => {
  render(<TestApp />)

  await waitFor(() => {
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })
})

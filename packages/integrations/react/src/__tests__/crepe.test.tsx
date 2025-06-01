import { Crepe } from '@milkdown/crepe'
import { render, screen, waitFor } from '@testing-library/react'
import React, { type FC } from 'react'
import { expect, test } from 'vitest'

import { Milkdown, MilkdownProvider } from '../editor'
import { useEditor } from '../use-editor'

const TestEditor: FC = () => {
  useEditor((root) => {
    const crepe = new Crepe({ root, defaultValue: '# Testing' })

    return crepe
  })

  return <Milkdown />
}

test('should render crepe', async () => {
  render(<TestEditor />, {
    wrapper: MilkdownProvider,
  })

  await waitFor(() => {
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })
})

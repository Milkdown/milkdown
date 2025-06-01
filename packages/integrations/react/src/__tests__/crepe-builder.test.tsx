import { CrepeBuilder } from '@milkdown/crepe/builder'
import { blockEdit } from '@milkdown/crepe/feature/block-edit'
import { render, screen, waitFor } from '@testing-library/react'
import React, { type FC } from 'react'
import { expect, test } from 'vitest'

import { Milkdown, MilkdownProvider } from '../editor'
import { useEditor } from '../use-editor'

const TestEditor: FC = () => {
  useEditor((root) => {
    const crepe = new CrepeBuilder({ root, defaultValue: '# Testing' })
    crepe.addFeature(blockEdit, {
      handleAddIcon: '+',
    })

    return crepe
  })

  return <Milkdown />
}

test('should render crepe builder', async () => {
  render(<TestEditor />, {
    wrapper: MilkdownProvider,
  })

  await waitFor(() => {
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })
})

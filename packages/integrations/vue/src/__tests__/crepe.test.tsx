import { Crepe } from '@milkdown/crepe'
import { render, screen, waitFor } from '@testing-library/vue'
import { expect, test } from 'vitest'
import { defineComponent } from 'vue'

import { Milkdown, MilkdownProvider } from '../editor'
import { useEditor } from '../use-editor'

const TestEditor = defineComponent({
  setup() {
    useEditor((root) => {
      const crepe = new Crepe({ root, defaultValue: '# Testing' })

      return crepe
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

test('should render crepe', async () => {
  render(<TestApp />)

  await waitFor(() => {
    expect(screen.getByText('Testing')).toBeInTheDocument()
  })
})

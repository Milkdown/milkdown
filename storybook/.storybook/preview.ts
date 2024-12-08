import type { Preview } from '@storybook/html'

import './style.css'
import '@milkdown/theme-nord/style.css'

const preview: Preview = {
  parameters: {
    options: {
      // @ts-expect-error number
      storySort: (a, b) => {
        if (a.id.toLowerCase().includes('main')) return -1
        if (b.id.toLowerCase().includes('main')) return 1
        return a.id === b.id
          ? 0
          : a.id.localeCompare(b.id, undefined, { numeric: true })
      },
    },
  },
}

export default preview

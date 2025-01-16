import { Crepe } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

import { setup } from '../utils'

setup(async () => {
  const crepe = new Crepe({
    root: '#app',
  })
  if (globalThis.__beforeCrepeCreate__) {
    globalThis.__beforeCrepeCreate__(crepe)
  }
  await crepe.create()
  if (globalThis.__afterCrepeCreated__) {
    globalThis.__afterCrepeCreated__(crepe)
  }
  return crepe.editor
})

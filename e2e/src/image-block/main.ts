import { Crepe, CrepeFeature } from '@milkdown/crepe'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'
import { setup } from '../utils'

setup(async () => {
  const maxWidth = globalThis.__imageBlockMaxWidth__ as number | undefined
  const maxHeight = globalThis.__imageBlockMaxHeight__ as number | undefined

  const crepe = new Crepe({
    root: '#app',
    featureConfigs: {
      [CrepeFeature.ImageBlock]: {
        maxWidth,
        maxHeight,
      },
    },
  })
  await crepe.create()
  return crepe.editor
}).catch(console.error)

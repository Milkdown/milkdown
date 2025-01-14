import { Crepe } from '@milkdown/crepe'
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

import { setup } from '../utils'

setup(async () => {
  const crepe = new Crepe({
    root: '#app',
  })
  await crepe.create();
  return crepe.editor
})

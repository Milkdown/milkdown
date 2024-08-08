import { Crepe, CrepeFeature } from '@milkdown/crepe'
import { basicLight } from '@uiw/codemirror-theme-basic'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/nord.css'

import './style.css'

const crepe = new Crepe({
  root: '#app',
  features: {
    [CrepeFeature.CodeMirror]: true,
  },
  featureConfigs: {
    [CrepeFeature.CodeMirror]: {
      theme: basicLight,
    },
    [CrepeFeature.Placeholder]: {
      text: 'Type / to use slash command',
    },
  },
})

Object.assign(window, { crepe })

crepe.create().catch(console.error)

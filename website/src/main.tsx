/* Copyright 2021, Milkdown by Mirone. */
import '@milkdown/theme-nord/style.css'
import './style.css'
import './docsearch.css'
import './prosemirror.css'

import { createRoot } from 'react-dom/client'

import { AppProvider } from './provider'
import { App } from './component/App'

const root = document.getElementById('app')

if (!root)
  throw new Error('Root element #app not found')

createRoot(root).render(
  <AppProvider>
    <App />
  </AppProvider>,
)

/* Copyright 2021, Milkdown by Mirone. */
import './style.css'
import 'prosemirror-tables/style/tables.css'
import 'prosemirror-view/style/prosemirror.css'

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

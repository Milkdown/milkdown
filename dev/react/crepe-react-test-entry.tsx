import React from 'react'
import { createRoot } from 'react-dom/client'
import { MilkdownEditorWrapper } from './index.tsx'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<MilkdownEditorWrapper />)
}

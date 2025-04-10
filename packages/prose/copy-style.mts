import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const styles = [
  'prosemirror-view/style/prosemirror.css',
  'prosemirror-tables/style/tables.css',
  'prosemirror-gapcursor/style/gapcursor.css'
]

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ensure lib/style directory exists
fs.mkdirSync('lib/style', { recursive: true })

// Copy each style file
for (const style of styles) {
  const src = path.join(__dirname, 'node_modules', style)
  const dest = path.join(__dirname, 'lib/style', path.basename(style))
  fs.copyFileSync(src, dest)
}

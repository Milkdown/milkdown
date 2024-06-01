import { crepe } from './crepe'
import { multiEditor } from './multi-editor'
import { automd } from './plugin-automd'
import { math } from './plugin-math'
import { listener } from './plugin-listener'
import { commonmark } from './preset-commonmark'
import { gfm } from './preset-gfm'

export const cases: { title: string, link: string }[] = [
  crepe,
  commonmark,
  gfm,
  multiEditor,
  listener,
  automd,
  math,
]

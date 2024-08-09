import { multiEditor } from './multi-editor'
import { automd } from './plugin-automd'
import { math } from './plugin-math'
import { listener } from './plugin-listener'
import { commonmark } from './preset-commonmark'
import { gfm } from './preset-gfm'

export const cases: { title: string, link: string }[] = [
  commonmark,
  gfm,
  multiEditor,
  listener,
  automd,
  math,
]

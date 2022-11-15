/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { ThemeUtils } from '@milkdown/utils'

import type { StatusConfigBuilder } from '..'
import { createProps } from './props'
import { createStatus } from './status'
import type { CalcPosition } from './view'
import { createView } from './view'

export const key = 'MILKDOWN_SLASH'

export const createSlashPlugin = (
  utils: ThemeUtils,
  builder: StatusConfigBuilder,
  className: string,
  calcPosition: CalcPosition,
) => {
  const status = createStatus(builder)

  return new Plugin({
    key: new PluginKey(key),
    props: createProps(status, utils),
    view: view => createView(status, view, utils, className, calcPosition),
  })
}

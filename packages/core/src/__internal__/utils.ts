/* Copyright 2021, Milkdown by Mirone. */
import type { Meta, MilkdownPlugin } from '@milkdown/ctx'

export const withMeta = <T extends MilkdownPlugin>(plugin: T, meta: Partial<Meta> & Pick<Meta, 'displayName'>): T => {
  plugin.meta = {
    package: '@milkdown/core',
    group: 'System',
    ...meta,
  }

  return plugin
}

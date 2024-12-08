import type { Meta, MilkdownPlugin } from '@milkdown/ctx'

export function withMeta<T extends MilkdownPlugin>(
  plugin: T,
  meta: Partial<Meta> & Pick<Meta, 'displayName'>
): T {
  Object.assign(plugin, {
    meta: {
      package: '@milkdown/preset-commonmark',
      ...meta,
    },
  })

  return plugin
}

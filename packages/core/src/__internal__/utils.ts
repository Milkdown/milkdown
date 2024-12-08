import type { Meta, MilkdownPlugin } from '@milkdown/ctx'

export function withMeta<T extends MilkdownPlugin>(
  plugin: T,
  meta: Partial<Meta> & Pick<Meta, 'displayName'>
): T {
  plugin.meta = {
    package: '@milkdown/core',
    group: 'System',
    ...meta,
  }

  return plugin
}

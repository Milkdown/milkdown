/* Copyright 2021, Milkdown by Mirone. */
import type { ConfigItem, Local } from './page-router'

export const config: ConfigItem[] = [
  {
    dir: 'guide',
    items: [
      'why-milkdown',
      'getting-started',
      'styling',
      'interacting-with-editor',
      'commands',
      'keyboard-shortcuts',
      'macros',
      'collaborative-editing',
      'faq',
    ],
  },
  {
    dir: 'recipes',
    items: [
      'react',
      'vue',
      'svelte',
      'solidjs',
      'nextjs',
      'nuxtjs',
      'angular',
      'vue2',
    ],
  },
  {
    dir: 'plugin',
    items: [
      'using-plugins',
      'plugins-101',
      'composable-plugins',
      'example-iframe-plugin',
    ],
  },
  {
    dir: 'api',
    items: [
      'core',
      'ctx',
      'transformer',
      'utils',
      'preset-commonmark',
      'preset-gfm',
      'plugin-listener',
      'plugin-history',
      'plugin-math',
      'plugin-diagram',
      'plugin-emoji',
      'plugin-prism',
      'plugin-cursor',
      'plugin-tooltip',
      'plugin-slash',
      'plugin-block',
      'plugin-indent',
      'plugin-trailing',
      'plugin-upload',
      'plugin-clipboard',
      'plugin-collaborative',
    ],
  },
]

export const i18nConfig: Record<Local, { display: string; route: string }> = {
  'en': {
    display: 'English',
    route: '',
  },
  'zh-hans': {
    display: '简体中文',
    route: 'zh-hans',
  },
}

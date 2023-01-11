/* Copyright 2021, Milkdown by Mirone. */
import type { ConfigItem, Local } from './page-router'

export const config: ConfigItem[] = [
  {
    dir: 'guide',
    items: [
      'why-milkdown',
      'getting-started',
      'interacting-with-editor',
      'commands',
      'styling',
      'keyboard-shortcuts',
      'macros',
      'collaborative-editing',
      'i18n',
      'faq',
    ],
  },
  {
    dir: 'recipes',
    items: ['react', 'vue', 'svelte', 'solidjs', 'nextjs', 'nuxtjs', 'angular', 'vue2'],
  },
  {
    dir: 'plugin',
    items: [
      'using-plugins',
      'plugins-101',
      'plugin-factories',
      'composable-plugins',
      'example-iframe-plugin',
      'internal-plugins',
    ],
  },
  {
    dir: 'api',
    items: [
      'preset-commonmark',
      'preset-gfm',
      'plugin-listener',
      'plugin-history',
      'plugin-prism',
      'plugin-tooltip',
      'plugin-slash',
      'plugin-menu',
      'plugin-block',
      'plugin-indent',
      'plugin-trailing',
      'plugin-emoji',
      'plugin-collaborative',
      'plugin-upload',
      'plugin-cursor',
      'plugin-math',
      'plugin-diagram',
      'plugin-clipboard',
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
    'zh-tw': {
    display: '繁體中文',
    route: 'zh-tw',
  },
}

/* Copyright 2021, Milkdown by Mirone. */
import type { Dict, Local } from './page-router'

export const i18nDict: Dict = new Map([
  [
    'guide',
    {
      'en': 'Guide',
      'zh-hans': '引导',
      'zh-tw': '引導',
    },
  ],
  [
    'why-milkdown',
    {
      'en': 'Why Milkdown',
      'zh-hans': '为什么使用Milkdown',
      'zh-tw': '為什麼使用Milkdown',
    },
  ],
  [
    'getting-started',
    {
      'en': 'Getting Started',
      'zh-hans': '開始使用',
      'zh-tw': '開始使用',
    },
  ],
  [
    'interacting-with-editor',
    {
      'en': 'Interacting With Editor',
      'zh-hans': '与编辑器交互',
      'zh-tw': '與編輯器互動',
    },
  ],
  [
    'commands',
    {
      'en': 'Commands',
      'zh-hans': '命令',
      'zh-tw': '指令',
    },
  ],
  [
    'styling',
    {
      'en': 'Styling',
      'zh-hans': '样式',
      'zh-tw': '樣式',
    },
  ],
  [
    'keyboard-shortcuts',
    {
      'en': 'Keyboard Shortcuts',
      'zh-hans': '快捷键',
      'zh-tw': '快捷鍵',
    },
  ],
  [
    'macros',
    {
      'en': 'Macros',
      'zh-hans': '宏',
      'zh-tw': '巨集',
    },
  ],
  [
    'collaborative-editing',
    {
      'en': 'Collaborative Editing',
      'zh-hans': '协同编辑',
      'zh-tw': '共同編輯',
    },
  ],
  [
    'i18n',
    {
      'en': 'I18n',
      'zh-hans': 'I18n',
      'zh-tw': 'I18n',
    },
  ],
  [
    'faq',
    {
      'en': 'FAQ',
      'zh-hans': 'FAQ',
      'zh-tw': 'FAQ',
    },
  ],
  [
    'recipes',
    {
      'en': 'Recipes',
      'zh-hans': '配方',
      'zh-tw': '配方',
    },
  ],
  [
    'react',
    {
      'en': 'React',
      'zh-hans': 'React',
      'zh-tw': 'React',
    },
  ],
  [
    'vue',
    {
      'en': 'Vue',
      'zh-hans': 'Vue',
      'zh-tw': 'Vue',
    },
  ],
  [
    'angular',
    {
      'en': 'Angular',
      'zh-hans': 'Angular',
      'zh-tw': 'Angular',
    },
  ],
  [
    'svelte',
    {
      'en': 'Svelte',
      'zh-hans': 'Svelte',
      'zh-tw': 'Svelte',
    },
  ],
  [
    'solidjs',
    {
      'en': 'SolidJS',
      'zh-hans': 'SolidJS',
      'zh-tw': 'SolidJS',
    },
  ],
  [
    'nextjs',
    {
      'en': 'Next.js',
      'zh-hans': 'Next.js',
      'zh-tw': 'Next.js',
    },
  ],
  [
    'nuxtjs',
    {
      'en': 'NuxtJS',
      'zh-hans': 'NuxtJS',
      'zh-tw': 'NuxtJS',
    },
  ],
  [
    'vue2',
    {
      'en': 'Vue2',
      'zh-hans': 'Vue2',
      'zh-tw': 'Vue2',
    },
  ],
  [
    'plugin',
    {
      'en': 'Plugin',
      'zh-hans': '插件',
      'zh-tw': '外掛',
    },
  ],
  [
    'using-plugins',
    {
      'en': 'Using Plugins',
      'zh-hans': '使用外掛',
      'zh-tw': '使用外掛',
    },
  ],
  [
    'plugins-101',
    {
      'en': 'Plugins 101',
      'zh-hans': '从0到1写插件',
      'zh-tw': '從0到1寫外掛',
    },
  ],
  [
    'plugin-factories',
    {
      'en': 'Plugin Factories',
      'zh-hans': '插件工厂',
      'zh-tw': '外掛工廠',
    },
  ],
  [
    'composable-plugins',
    {
      'en': 'Composable Plugins',
      'zh-hans': '可组合插件',
      'zh-tw': '可組合外掛',
    },
  ],
  [
    'example-iframe-plugin',
    {
      'en': 'Example: Iframe Plugin',
      'zh-hans': '例子: Iframe插件',
      'zh-tw': '例子: Iframe外掛',
    },
  ],
  [
    'tools',
    {
      'en': 'Tools',
      'zh-hans': '内部',
      'zh-tw': '工具',
    },
  ],
  [
    'prose',
    {
      'en': 'Prose',
      'zh-hans': 'Prose',
      'zh-tw': 'Prose',
    },
  ],
  [
    'using-utils-package',
    {
      'en': 'Using Utils Package',
      'zh-hans': '使用工具包',
      'zh-tw': '使用工具箱',
    },
  ],
  [
    'design-system',
    {
      'en': 'Design System',
      'zh-hans': '设计系统',
      'zh-tw': '設計系統',
    },
  ],
  [
    'internals',
    {
      'en': 'Internals',
      'zh-hans': '内部',
      'zh-tw': '內部',
    },
  ],
  [
    'architecture',
    {
      'en': 'Architecture',
      'zh-hans': '架构',
      'zh-tw': '架構',
    },
  ],
  [
    'node-and-mark',
    {
      'en': 'Node & Mark',
      'zh-hans': 'Node & Mark',
      'zh-tw': 'Node & Mark',
    },
  ],
  [
    'parser',
    {
      'en': 'Parser',
      'zh-hans': '解析器',
      'zh-tw': '解析器',
    },
  ],
  [
    'serializer',
    {
      'en': 'Serializer',
      'zh-hans': '序列化',
      'zh-tw': '序列化',
    },
  ],
  [
    'internal-plugins',
    {
      'en': 'Internal Plugins',
      'zh-hans': '内置插件',
      'zh-tw': '內建外掛',
    },
  ],
  [
    'get-started',
    {
      'en': 'Get Started',
      'zh-hans': '快速开始',
      'zh-tw': '快速開始',
    },
  ],
  [
    'try-online',
    {
      'en': 'Try Online',
      'zh-hans': '在线体验',
      'zh-tw': '線上體驗',
    },
  ],
  [
    'home-describe',
    {
      'en': 'Plugin Based WYSIWYG Markdown Editor Framework',
      'zh-hans': '插件驱动的所见即所得的Markdown编辑器框架',
      'zh-tw': '外掛驅動的所見即所得的Markdown編輯器框架',
    },
  ],
  [
    'theme',
    {
      'en': 'Theme',
      'zh-hans': '主题',
      'zh-tw': '主題',
    },
  ],
  [
    'using-themes',
    {
      'en': 'Using Themes',
      'zh-hans': '使用主题',
      'zh-tw': '使用主題',
    },
  ],
  [
    'writing-themes',
    {
      'en': 'Writing Themes',
      'zh-hans': '编写主题',
      'zh-tw': '編寫主題',
    },
  ],
  [
    'api',
    {
      'en': 'API',
      'zh-hans': 'API',
      'zh-tw': 'API',
    },
  ],
  [
    'core',
    {
      'en': 'core',
      'zh-hans': 'core',
      'zh-tw': 'core',
    },
  ],
  [
    'prose',
    {
      'en': 'prose',
      'zh-hans': 'prose',
      'zh-tw': 'prose',
    },
  ],
  [
    'ctx',
    {
      'en': 'ctx',
      'zh-hans': 'ctx',
      'zh-tw': 'ctx',
    },
  ],
  [
    'transformer',
    {
      'en': 'transformer',
      'zh-hans': 'transformer',
      'zh-tw': 'transformer',
    },
  ],
  [
    'preset-commonmark',
    {
      'en': 'preset-commonmark',
      'zh-hans': 'preset-commonmark',
      'zh-tw': 'preset-commonmark',
    },
  ],
  [
    'preset-gfm',
    {
      'en': 'preset-gfm',
      'zh-hans': 'preset-gfm',
      'zh-tw': 'preset-gfm',
    },
  ],
  [
    'plugin-listener',
    {
      'en': 'plugin-listener',
      'zh-hans': 'plugin-listener',
      'zh-tw': 'plugin-listener',
    },
  ],
  [
    'plugin-tooltip',
    {
      'en': 'plugin-tooltip',
      'zh-hans': 'plugin-tooltip',
      'zh-tw': 'plugin-tooltip',
    },
  ],
  [
    'plugin-slash',
    {
      'en': 'plugin-slash',
      'zh-hans': 'plugin-slash',
      'zh-tw': 'plugin-slash',
    },
  ],
  [
    'plugin-menu',
    {
      'en': 'plugin-menu',
      'zh-hans': 'plugin-menu',
      'zh-tw': 'plugin-menu',
    },
  ],
  [
    'plugin-prism',
    {
      'en': 'plugin-prism',
      'zh-hans': 'plugin-prism',
      'zh-tw': 'plugin-prism',
    },
  ],
  [
    'plugin-math',
    {
      'en': 'plugin-math',
      'zh-hans': 'plugin-math',
      'zh-tw': 'plugin-math',
    },
  ],
  [
    'plugin-clipboard',
    {
      'en': 'plugin-clipboard',
      'zh-hans': 'plugin-clipboard',
      'zh-tw': 'plugin-clipboard',
    },
  ],
  [
    'plugin-collaborative',
    {
      'en': 'plugin-collaborative',
      'zh-hans': 'plugin-collaborative',
      'zh-tw': 'plugin-collaborative',
    },
  ],
  [
    'plugin-upload',
    {
      'en': 'plugin-upload',
      'zh-hans': 'plugin-upload',
      'zh-tw': 'plugin-upload',
    },
  ],
  [
    'plugin-cursor',
    {
      'en': 'plugin-cursor',
      'zh-hans': 'plugin-cursor',
      'zh-tw': 'plugin-cursor',
    },
  ],
  [
    'plugin-diagram',
    {
      'en': 'plugin-diagram',
      'zh-hans': 'plugin-diagram',
      'zh-tw': 'plugin-diagram',
    },
  ],
  [
    'plugin-emoji',
    {
      'en': 'plugin-emoji',
      'zh-hans': 'plugin-emoji',
      'zh-tw': 'plugin-emoji',
    },
  ],
  [
    'plugin-history',
    {
      'en': 'plugin-history',
      'zh-hans': 'plugin-history',
      'zh-tw': 'plugin-history',
    },
  ],
  [
    'plugin-indent',
    {
      'en': 'plugin-indent',
      'zh-hans': 'plugin-indent',
      'zh-tw': 'plugin-indent',
    },
  ],
  [
    'plugin-trailing',
    {
      'en': 'plugin-trailing',
      'zh-hans': 'plugin-trailing',
      'zh-tw': 'plugin-trailing',
    },
  ],
  [
    'plugin-block',
    {
      'en': 'plugin-block',
      'zh-hans': 'plugin-block',
      'zh-tw': 'plugin-block',
    },
  ],
  [
    'theme-nord',
    {
      'en': 'Theme Nord',
      'zh-hans': 'Nord主题',
      'zh-tw': 'Nord主題',
    },
  ],
  [
    'theme-tokyo',
    {
      'en': 'Theme Tokyo',
      'zh-hans': 'Tokyo主题',
      'zh-tw': 'Tokyo主題',
    },
  ],
  [
    'theme-pack-helper',
    {
      'en': 'Theme Pack Helper',
      'zh-hans': '主题包助手',
      'zh-tw': '主題包助手',
    },
  ],
  [
    'playground',
    {
      'en': 'Playground',
      'zh-hans': '游乐场',
      'zh-tw': '遊樂場',
    },
  ],
])

export const fromDict = (key: string, local: Local) => i18nDict.get(key)?.[local] ?? 'Not Found'

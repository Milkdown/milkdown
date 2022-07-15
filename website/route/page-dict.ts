/* Copyright 2021, Milkdown by Mirone. */
import type { Dict, Local } from './page-router';

export const titleDict: Dict = new Map([
    [
        'guide',
        {
            en: 'Guide',
            'zh-hans': '引导',
        },
    ],
    [
        'why-milkdown',
        {
            en: 'Why Milkdown',
            'zh-hans': '为什么使用Milkdown',
        },
    ],
    [
        'getting-started',
        {
            en: 'Getting Started',
            'zh-hans': '开始使用',
        },
    ],
    [
        'interacting-with-editor',
        {
            en: 'Interacting With Editor',
            'zh-hans': '与编辑器交互',
        },
    ],
    [
        'commands',
        {
            en: 'Commands',
            'zh-hans': '命令',
        },
    ],
    [
        'styling',
        {
            en: 'Styling',
            'zh-hans': '样式',
        },
    ],
    [
        'keyboard-shortcuts',
        {
            en: 'Keyboard Shortcuts',
            'zh-hans': '快捷键',
        },
    ],
    [
        'macros',
        {
            en: 'Macros',
            'zh-hans': '宏',
        },
    ],
    [
        'collaborative-editing',
        {
            en: 'Collaborative Editing',
            'zh-hans': '协同编辑',
        },
    ],
    [
        'i18n',
        {
            en: 'i18n',
            'zh-hans': 'i18n',
        },
    ],
    [
        'faq',
        {
            en: 'FAQ',
            'zh-hans': 'FAQ',
        },
    ],
    [
        'integrations',
        {
            en: 'Integrations',
            'zh-hans': '集成',
        },
    ],
    [
        'react',
        {
            en: 'React',
            'zh-hans': 'React',
        },
    ],
    [
        'vue',
        {
            en: 'Vue',
            'zh-hans': 'Vue',
        },
    ],
    [
        'angular',
        {
            en: 'Angular',
            'zh-hans': 'Angular',
        },
    ],
    [
        'svelte',
        {
            en: 'Svelte',
            'zh-hans': 'Svelte',
        },
    ],
    [
        'solidjs',
        {
            en: 'SolidJS',
            'zh-hans': 'SolidJS',
        },
    ],
    [
        'nextjs',
        {
            en: 'Next.js',
            'zh-hans': 'Next.js',
        },
    ],
    [
        'vue2',
        {
            en: 'Vue2',
            'zh-hans': 'Vue2',
        },
    ],
    [
        'plugins',
        {
            en: 'Plugins',
            'zh-hans': '插件',
        },
    ],
    [
        'using-plugins',
        {
            en: 'Using Plugins',
            'zh-hans': '使用插件',
        },
    ],
    [
        'plugins-101',
        {
            en: 'Plugins 101',
            'zh-hans': '从0到1写插件',
        },
    ],
    [
        'plugin-factories',
        {
            en: 'Plugin Factories',
            'zh-hans': '插件工厂',
        },
    ],
    [
        'composable-plugins',
        {
            en: 'Composable Plugins',
            'zh-hans': '可组合插件',
        },
    ],
    [
        'example-iframe-plugin',
        {
            en: 'Example: Iframe Plugin',
            'zh-hans': '例子: Iframe插件',
        },
    ],
    [
        'tools',
        {
            en: 'Tools',
            'zh-hans': '内部',
        },
    ],
    [
        'prose',
        {
            en: 'Prose',
            'zh-hans': 'Prose',
        },
    ],
    [
        'using-utils-package',
        {
            en: 'Using Utils Package',
            'zh-hans': '使用工具包',
        },
    ],
    [
        'design-system',
        {
            en: 'Design System',
            'zh-hans': '设计系统',
        },
    ],
    [
        'internals',
        {
            en: 'Internals',
            'zh-hans': '内部',
        },
    ],
    [
        'architecture',
        {
            en: 'Architecture',
            'zh-hans': '架构',
        },
    ],
    [
        'node-and-mark',
        {
            en: 'Node & Mark',
            'zh-hans': 'Node & Mark',
        },
    ],
    [
        'parser',
        {
            en: 'Parser',
            'zh-hans': '解析器',
        },
    ],
    [
        'serializer',
        {
            en: 'Serializer',
            'zh-hans': '序列化',
        },
    ],
    [
        'internal-plugins',
        {
            en: 'Internal Plugins',
            'zh-hans': '内置插件',
        },
    ],
    [
        'get-started',
        {
            en: 'Get Started',
            'zh-hans': '快速开始',
        },
    ],
    [
        'try-online',
        {
            en: 'Try Online',
            'zh-hans': '在线体验',
        },
    ],
    [
        'home-describe',
        {
            en: 'Plugin Based WYSIWYG Markdown Editor Framework',
            'zh-hans': '插件驱动的所见即所得的Markdown编辑器框架',
        },
    ],
    [
        'theme',
        {
            en: 'Theme',
            'zh-hans': '主题',
        },
    ],
    [
        'using-themes',
        {
            en: 'Using Themes',
            'zh-hans': '使用主题',
        },
    ],
    [
        'writing-themes',
        {
            en: 'Writing Themes',
            'zh-hans': '编写主题',
        },
    ],
    [
        'official-plugins',
        {
            en: 'Official Plugins',
            'zh-hans': '官方插件',
        },
    ],
    [
        'core',
        {
            en: 'core',
            'zh-hans': 'core',
        },
    ],
    [
        'prose',
        {
            en: 'prose',
            'zh-hans': 'prose',
        },
    ],
    [
        'ctx',
        {
            en: 'ctx',
            'zh-hans': 'ctx',
        },
    ],
    [
        'transformer',
        {
            en: 'transformer',
            'zh-hans': 'transformer',
        },
    ],
    [
        'preset-commonmark',
        {
            en: 'preset-commonmark',
            'zh-hans': 'preset-commonmark',
        },
    ],
    [
        'preset-gfm',
        {
            en: 'preset-gfm',
            'zh-hans': 'preset-gfm',
        },
    ],
    [
        'plugin-listener',
        {
            en: 'plugin-listener',
            'zh-hans': 'plugin-listener',
        },
    ],
    [
        'plugin-tooltip',
        {
            en: 'plugin-tooltip',
            'zh-hans': 'plugin-tooltip',
        },
    ],
    [
        'plugin-slash',
        {
            en: 'plugin-slash',
            'zh-hans': 'plugin-slash',
        },
    ],
    [
        'plugin-menu',
        {
            en: 'plugin-menu',
            'zh-hans': 'plugin-menu',
        },
    ],
    [
        'plugin-prism',
        {
            en: 'plugin-prism',
            'zh-hans': 'plugin-prism',
        },
    ],
    [
        'plugin-math',
        {
            en: 'plugin-math',
            'zh-hans': 'plugin-math',
        },
    ],
    [
        'plugin-clipboard',
        {
            en: 'plugin-clipboard',
            'zh-hans': 'plugin-clipboard',
        },
    ],
    [
        'plugin-collaborative',
        {
            en: 'plugin-collaborative',
            'zh-hans': 'plugin-collaborative',
        },
    ],
    [
        'plugin-upload',
        {
            en: 'plugin-upload',
            'zh-hans': 'plugin-upload',
        },
    ],
    [
        'plugin-cursor',
        {
            en: 'plugin-cursor',
            'zh-hans': 'plugin-cursor',
        },
    ],
    [
        'plugin-diagram',
        {
            en: 'plugin-diagram',
            'zh-hans': 'plugin-diagram',
        },
    ],
    [
        'plugin-emoji',
        {
            en: 'plugin-emoji',
            'zh-hans': 'plugin-emoji',
        },
    ],
    [
        'plugin-history',
        {
            en: 'plugin-history',
            'zh-hans': 'plugin-history',
        },
    ],
    [
        'plugin-indent',
        {
            en: 'plugin-indent',
            'zh-hans': 'plugin-indent',
        },
    ],
    [
        'plugin-trailing',
        {
            en: 'plugin-trailing',
            'zh-hans': 'plugin-trailing',
        },
    ],
    [
        'theme-nord',
        {
            en: 'Theme Nord',
            'zh-hans': 'Theme Nord',
        },
    ],
    [
        'theme-tokyo',
        {
            en: 'Theme Tokyo',
            'zh-hans': 'Theme Tokyo',
        },
    ],
    [
        'theme-pack-helper',
        {
            en: 'Theme Pack Helper',
            'zh-hans': '主题包助手',
        },
    ],
    [
        'core-modules',
        {
            en: 'Core Modules',
            'zh-hans': '核心模块',
        },
    ],
]);

export const fromDict = (key: string, local: Local) => titleDict.get(key)?.[local] ?? 'Not Found';

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
        'reference-manual',
        {
            en: 'Reference Manual',
            'zh-hans': '参考手册',
        },
    ],
    [
        'milkdown_core',
        {
            en: '@milkdown/core',
            'zh-hans': '@milkdown/core',
        },
    ],
    [
        'milkdown_plugin-listener',
        {
            en: '@milkdown/plugin-listener',
            'zh-hans': '@milkdown/plugin-listener',
        },
    ],
]);

export const fromDict = (key: string, local: Local) => titleDict.get(key)?.[local] ?? 'Not Found';

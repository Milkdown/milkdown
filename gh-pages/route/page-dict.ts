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
        'integrating-plugins',
        {
            en: 'Integrating Plugins',
            'zh-hans': '集成插件',
        },
    ],
    [
        'writing-syntax-plugins',
        {
            en: 'Writing Syntax Plugins',
            'zh-hans': '编写语法插件',
        },
    ],
    [
        'writing-theme-plugins',
        {
            en: 'Writing Theme Plugins',
            'zh-hans': '编写主题插件',
        },
    ],
    [
        'writing-custom-plugins',
        {
            en: 'Writing Custom Plugins',
            'zh-hans': '编写自定义插件',
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
]);

export const fromDict = (key: string, local: Local) => titleDict.get(key)?.[local] ?? 'Not Found';

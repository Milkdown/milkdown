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
        'example-custom-syntax',
        {
            en: 'Example: Custom Syntax',
            'zh-hans': '示例：自定义语法',
        },
    ],
    [
        'writing-plugins',
        {
            en: 'Writing Plugins',
            'zh-hans': '编写插件',
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

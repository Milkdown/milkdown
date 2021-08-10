import type { Section } from './component/Sidebar/Sidebar';

export const pageRouter: Section[] = [
    {
        title: 'Guide',
        items: [
            { title: 'Why Milkdown', link: '/why-milkdown', content: () => import('./pages/guide/why-milkdown.md') },
            {
                title: 'Getting Started',
                link: '/getting-started',
                content: () => import('./pages/guide/getting-started.md'),
            },
            {
                title: 'Interacting with Editor',
                link: '/interacting-with-editor',
                content: () => import('./pages/guide/interacting-with-editor.md'),
            },
            {
                title: 'Commands',
                link: '/commands',
                content: () => import('./pages/guide/commands.md'),
            },
            {
                title: 'Styling',
                link: '/styling',
                content: () => import('./pages/guide/styling.md'),
            },
            {
                title: 'Keyboard Shortcuts',
                link: '/keyboard-shortcuts',
                content: () => import('./pages/guide/keyboard-shortcuts.md'),
            },
        ],
    },
    {
        title: 'Integrations',
        items: [
            {
                title: 'React',
                link: '/react',
                content: () => import('./pages/integrations/react.md'),
            },
            {
                title: 'Vue',
                link: '/vue',
                content: () => import('./pages/integrations/vue.md'),
            },
        ],
    },
    {
        title: 'Plugins',
        items: [
            {
                title: 'Using Plugins',
                link: '/using-plugins',
                content: () => import('./pages/plugins/using-plugins.md'),
            },
            {
                title: 'Integrating Plugins',
                link: '/integrating-plugins',
                content: () => import('./pages/plugins/integrating-plugins.md'),
            },
            {
                title: 'Example: Custom Syntax',
                link: '/example-custom-syntax',
                content: () => import('./pages/plugins/example-custom-syntax.md'),
            },
            {
                title: 'Writing Plugins',
                link: '/writing-plugins',
                content: () => import('./pages/plugins/writing-plugins.md'),
            },
        ],
    },
    {
        title: 'Internals',
        items: [
            { title: 'Node & Mark', link: '/node-and-mark', content: () => import('./pages/internals/node&mark.md') },
            { title: 'Parser', link: '/parser', content: () => import('./pages/internals/parser.md') },
            { title: 'Serializer', link: '/serializer', content: () => import('./pages/internals/serializer.md') },
            {
                title: 'Internal Plugins',
                link: '/internal-plugins',
                content: () => import('./pages/internals/internal-plugins.md'),
            },
        ],
    },
];

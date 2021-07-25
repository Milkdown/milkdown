import type { Section } from './component/Sidebar/Sidebar';

import whyMilkdown from './pages/guide/why-milkdown.md';
import gettingStarted from './pages/guide/getting-started.md';
import interactingWithEditor from './pages/guide/interacting-with-editor.md';
import styling from './pages/guide/styling.md';
import keyboardShortcuts from './pages/guide/keyboard-shortcuts.md';

import react from './pages/integrations/react.md';
import vue from './pages/integrations/vue.md';

import writingPlugins from './pages/plugins/writing-plugins.md';
import usingPlugins from './pages/plugins/using-plugins.md';
import nodeAndMark from './pages/plugins/node&mark.md';
import integratingPlugins from './pages/plugins/integrating-plugins.md';
import parser from './pages/plugins/parser.md';
import serializer from './pages/plugins/serializer.md';
import exampleCustomSyntax from './pages/plugins/example-custom-syntax.md';
import internalPlugins from './pages/plugins/internal-plugins.md';

export const pageRouter: Section[] = [
    {
        title: 'Guide',
        items: [
            { title: 'Why Milkdown', link: '/why-milkdown', content: whyMilkdown },
            { title: 'Getting Started', link: '/getting-started', content: gettingStarted },
            {
                title: 'Interacting with Editor',
                link: '/interacting-with-editor',
                content: interactingWithEditor,
            },
            {
                title: 'Styling',
                link: '/styling',
                content: styling,
            },
            {
                title: 'Keyboard Shortcuts',
                link: '/keyboard-shortcuts',
                content: keyboardShortcuts,
            },
        ],
    },
    {
        title: 'Integrations',
        items: [
            {
                title: 'React',
                link: '/react',
                content: react,
            },
            {
                title: 'Vue',
                link: '/vue',
                content: vue,
            },
        ],
    },
    {
        title: 'Plugins',
        items: [
            { title: 'Using Plugins', link: '/using-plugins', content: usingPlugins },
            { title: 'Integrating Plugins', link: '/integrating-plugins', content: integratingPlugins },
            { title: 'Node & Mark', link: '/node-and-mark', content: nodeAndMark },
            { title: 'Parser', link: '/parser', content: parser },
            { title: 'Serializer', link: '/serializer', content: serializer },
            { title: 'Example: Custom Syntax', link: '/example-custom-syntax', content: exampleCustomSyntax },
            { title: 'Writing Plugins', link: '/writing-plugins', content: writingPlugins },
            { title: 'Internal Plugins', link: '/internal-plugins', content: internalPlugins },
        ],
    },
];

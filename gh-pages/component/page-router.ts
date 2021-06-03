import { Section } from './Sidebar/Sidebar';

import whyMilkdown from '../pages/guide/why-milkdown.md';
import gettingStarted from '../pages/guide/getting-started.md';
import usingPlugins from '../pages/guide/using-plugins.md';
import interactingWithEditor from '../pages/guide/interacting-with-editor.md';

import core from '../pages/architecture/core.md';
import atom from '../pages/architecture/atom.md';
import ordering from '../pages/architecture/ordering.md';

export const pageRouter: Section[] = [
    {
        title: 'Guide',
        items: [
            { title: 'Why Milkdown', link: '/why-milkdown', content: whyMilkdown },
            { title: 'Getting Started', link: '/getting-started', content: gettingStarted },
            { title: 'Using Plugins', link: '/using-plugins', content: usingPlugins },
            {
                title: 'Interacting with Editor',
                link: '/interacting-with-editor',
                content: interactingWithEditor,
            },
        ],
    },
    {
        title: 'Architecture',
        items: [
            { title: 'Core', link: '/core', content: core },
            { title: 'Atom', link: '/atom', content: atom },
            { title: 'Ordering', link: '/ordering', content: ordering },
        ],
    },
    {
        title: 'APIs',
        items: [
            { title: 'Core API', link: '/core-api', content: '# Core API\n\n Coming soon...' },
            { title: 'Plugin API', link: '/plugin-api', content: '# Plugin API\n\n Coming soon...' },
        ],
    },
];

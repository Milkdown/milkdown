import { Section } from './Sidebar/Sidebar';

import whyMilkdown from '../pages/guide/why-milkdown.md';
import gettingStarted from '../pages/guide/getting-started.md';
import usingPlugins from '../pages/guide/using-plugins.md';
import interactingWithEditor from '../pages/guide/interacting-with-editor.md';

import core from '../pages/architecture/core.md';
import atom from '../pages/architecture/atom.md';
import ordering from '../pages/architecture/ordering.md';
import nodeAndMark from '../pages/architecture/node&mark.md';
import buildingPlugins from '../pages/architecture/building-plugins.md';

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
        ],
    },
    {
        title: 'Plugins',
        items: [
            { title: 'Using Plugins', link: '/using-plugins', content: usingPlugins },
            { title: 'Building Plugins', link: '/building-plugins', content: buildingPlugins },
            { title: 'Node & Mark', link: '/node-and-mark', content: nodeAndMark },
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
];

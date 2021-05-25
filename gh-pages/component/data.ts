import { Section } from './Sidebar/Sidebar';

import whyMilkdown from '../pages/why-milkdown.md';
import features from '../pages/features.md';
import getStarted from '../pages/get-started.md';
import usingPlugins from '../pages/using-plugins.md';

export const data: Section[] = [
    {
        title: 'Guide',
        items: [
            { title: 'Why Milkdown', link: '/why-milkdown', content: whyMilkdown },
            { title: 'Get Started', link: '/get-started', content: getStarted },
            { title: 'Features', link: '/features', content: features },
            { title: 'Using Plugins', link: '/using-plugins', content: usingPlugins },
        ],
    },
    {
        title: 'APIs',
        items: [
            { title: 'Core API', link: '/core-api', content: '' },
            { title: 'Plugin API', link: '/plugin-api', content: '' },
        ],
    },
];

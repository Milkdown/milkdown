import { Section } from './Sidebar/Sidebar';

import whyMilkdown from '../pages/why-milkdown.md';
import getStarted from '../pages/get-started.md';

export const data: Section[] = [
    {
        title: 'Guide',
        items: [
            { title: 'Why Milkdown', link: '/why-milkdown', content: whyMilkdown },
            { title: 'Get Started', link: '/get-started', content: getStarted },
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

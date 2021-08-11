import { ConfigItem } from './page-router';

export const config: ConfigItem[] = [
    {
        dir: 'guide',
        items: [
            'why-milkdown',
            'getting-started',
            'interacting-with-editor',
            'commands',
            'styling',
            'keyboard-shortcuts',
        ],
    },
    {
        dir: 'integrations',
        items: ['react', 'vue'],
    },
    {
        dir: 'plugins',
        items: ['using-plugins', 'integrating-plugins', 'example-custom-syntax', 'writing-plugins'],
    },
    {
        dir: 'internals',
        items: ['node-and-mark', 'parser', 'serializer', 'internal-plugins'],
    },
];

import type { Section } from './component/Sidebar/Sidebar';

const createItem = (path: string) => {
    return {
        title: path
            .split('-')
            .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1))
            .join(' '),
        link: '/' + path,
        content: () => import(`./pages/guide/${path}/index.md`),
    };
};

type ConfigItem = {
    title: string;
    items: string[];
};

const mapConfig = ({ title, items }: ConfigItem): Section => ({
    title,
    items: items.map((item) => createItem(item)),
});

const config: ConfigItem[] = [
    {
        title: 'Guide',
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
        title: 'Integrations',
        items: ['react', 'vue'],
    },
    {
        title: 'Plugins',
        items: ['using-plugins', 'integrating-plugins', 'example-custom-syntax', 'writing-plugins'],
    },
    {
        title: 'Internals',
        items: ['node-and-mark', 'parser', 'serializer', 'internal-plugins'],
    },
];

export const toRouter = (config: ConfigItem[]): Section[] => config.map(mapConfig);

export const pageRouter: Section[] = toRouter(config);

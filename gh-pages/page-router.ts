import type { Section } from './component/Sidebar/Sidebar';

const createItem = (dir: string, path: string) => {
    return {
        title: path
            .split('-')
            .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1))
            .join(' '),
        link: '/' + path,
        content: () => import(`./pages/${dir}/${path}/index.md`),
    };
};

type ConfigItem = {
    title: string;
    dir: string;
    items: string[];
};

const mapConfig = ({ title, dir, items }: ConfigItem): Section => ({
    title,
    items: items.map((item) => createItem(dir, item)),
});

const config: ConfigItem[] = [
    {
        title: 'Guide',
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
        title: 'Integrations',
        dir: 'integrations',
        items: ['react', 'vue'],
    },
    {
        title: 'Plugins',
        dir: 'plugins',
        items: ['using-plugins', 'integrating-plugins', 'example-custom-syntax', 'writing-plugins'],
    },
    {
        title: 'Internals',
        dir: 'internals',
        items: ['node-and-mark', 'parser', 'serializer', 'internal-plugins'],
    },
];

export const toRouter = (config: ConfigItem[]): Section[] => config.map(mapConfig);

export const pageRouter: Section[] = toRouter(config);

import type { Section } from '../component/Sidebar/Sidebar';
import { config } from './page-config';
import { titleDict } from './page-dict';

export type Local = 'en';

export type ConfigItem = {
    dir: string;
    items: string[];
};

const fromDict = (key: string, local: Local) => titleDict.get(key)?.[local] ?? 'Not Found';

const createItem = (dir: string, path: string, local: Local) => {
    return {
        title: fromDict(path, local),
        link: '/' + path,
        content: () => import(`../pages/${dir}/${path}/index.md`),
    };
};

const mapConfig = ({ dir, items }: ConfigItem, local: Local): Section => ({
    title: fromDict(dir, local),
    items: items.map((item) => createItem(dir, item, local)),
});

export const toRouter = (config: ConfigItem[], local: Local = 'en'): Section[] =>
    config.map((cfg) => mapConfig(cfg, local));

export const pageRouter: Section[] = toRouter(config);

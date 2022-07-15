/* Copyright 2021, Milkdown by Mirone. */
import { config, i18nConfig } from './page-config';
import { fromDict } from './page-dict';

export type Item = {
    title: string;
    link: string;
    content: () => Promise<{ default: string }>;
};
export type Section = {
    title: string;
    items: Item[];
};

export type ConfigItem = {
    dir: string;
    items: string[];
};

const createItem = (dir: string, path: string, local: Local) => {
    const route = i18nConfig[local].route;
    const fileName = ['index', route].filter((x) => x).join('.');
    return {
        title: fromDict(path, local),
        link: '/' + [route, path].filter((x) => x).join('/'),
        content: () => import(`../pages/${dir}/${path}/${fileName}.md`),
    };
};

const mapConfig = ({ dir, items }: ConfigItem, local: Local): Section => ({
    title: fromDict(dir, local),
    items: items.map((item) => createItem(dir, item, local)),
});

const toRouter = (config: ConfigItem[], local: Local): Section[] => config.map((cfg) => mapConfig(cfg, local));

export type Dict = Map<string, Record<Local, string>>;

export type Local = 'en' | 'zh-hans';
export const pageRouter: Record<Local, Section[]> = {
    en: toRouter(config, 'en'),
    'zh-hans': toRouter(config, 'zh-hans'),
};

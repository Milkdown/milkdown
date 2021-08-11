import type { Section } from '../component/Sidebar/Sidebar';
import { config } from './page-config';
import { fromDict } from './page-dict';

export type Local = 'en' | 'zh-hans';

export type ConfigItem = {
    dir: string;
    items: string[];
};

const createItem = (dir: string, path: string, local: Local) => {
    const fileName = `index${local === 'en' ? '' : `.${local}`}`;
    return {
        title: fromDict(path, local),
        link: local === 'en' ? '/' + path : `/${local}/${path}`,
        content: () => import(`../pages/${dir}/${path}/${fileName}.md`),
    };
};

const mapConfig = ({ dir, items }: ConfigItem, local: Local): Section => ({
    title: fromDict(dir, local),
    items: items.map((item) => createItem(dir, item, local)),
});

const toRouter = (config: ConfigItem[], local: Local): Section[] => config.map((cfg) => mapConfig(cfg, local));

export type Dict = Map<string, Partial<Record<Local, string>>>;

export const pageRouter: Record<Local, Section[]> = {
    en: toRouter(config, 'en'),
    'zh-hans': toRouter(config, 'zh-hans'),
};

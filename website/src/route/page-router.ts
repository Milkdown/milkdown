/* Copyright 2021, Milkdown by Mirone. */
import { config, i18nConfig } from './page-config'
import { fromDict } from './i18n'

export interface Item {
  id: string
  title: string
  link: string
  parentId: string
  content: () => Promise<{ default: string }>
}
export interface Section {
  id: string
  title: string
  items: Item[]
}

export interface ConfigItem {
  dir: string
  items: string[]
}

const createItem = (dir: string, path: string, local: Local): Item => {
  const route = i18nConfig[local].route
  const fileName = ['index', route].filter(x => x).join('.')
  return {
    id: path,
    parentId: dir,
    title: fromDict(path, local),
    link: `/${[route, path].filter(x => x).join('/')}`,
    content: () => import(`../../pages/${dir}/${path}/${fileName}.md`),
  }
}

const mapConfig = ({ dir, items }: ConfigItem, local: Local): Section => ({
  id: dir,
  title: fromDict(dir, local),
  items: items.map(item => createItem(dir, item, local)),
})

const toRouter = (config: ConfigItem[], local: Local): Section[] => config.map(cfg => mapConfig(cfg, local))

export type Local = 'en' | 'zh-hans' | 'zh-tw' 
export type Dict = Map<string, Record<Local, string>>

export const pageRouter: Record<Local, Section[]> = {
  'en': toRouter(config, 'en'),
  'zh-hans': toRouter(config, 'zh-hans'),
  'zh-tw': toRouter(config, 'zh-tw'),
}

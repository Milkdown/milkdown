import type { MenuItem, MenuItemGroup } from './utils'

export class GroupBuilder {
  #groups: MenuItemGroup<false>[] = []

  clear = () => {
    this.#groups = []
    return this
  }

  #getGroupInstance = (group: MenuItemGroup<false>) => {
    const groupInstance = {
      group,
      addItem: (key: string, item: Omit<MenuItem, 'key' | 'index'>) => {
        const data = { key, ...item }
        group.items.push(data)
        return groupInstance
      },
      clear: () => {
        group.items = []
        return groupInstance
      },
    }
    return groupInstance
  }

  addGroup = (key: string, label: string) => {
    const items: Omit<MenuItem, 'index'>[] = []
    const group: MenuItemGroup<false> = {
      key,
      label,
      items,
    }
    this.#groups.push(group)

    return this.#getGroupInstance(group)
  }

  getGroup = (key: string) => {
    const group = this.#groups.find(group => group.key === key)
    if (!group)
      throw new Error(`Group with key ${key} not found`)

    return this.#getGroupInstance(group)
  }

  build = () => {
    return this.#groups
  }
}

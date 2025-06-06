import type { Ctx } from '@milkdown/kit/ctx'

export type MenuItem<T> = {
  index: number
  key: string
  onRun: (ctx: Ctx) => void
} & T

type WithRange<T, HasIndex extends true | false = true> = HasIndex extends true
  ? T & { range: [start: number, end: number] }
  : T

export type MenuItemGroup<T, HasIndex extends true | false = true> = WithRange<
  {
    key: string
    label: string
    items: HasIndex extends true ? MenuItem<T>[] : Omit<MenuItem<T>, 'index'>[]
  },
  HasIndex
>

export class GroupBuilder<T> {
  #groups: MenuItemGroup<T, false>[] = []

  clear = () => {
    this.#groups = []
    return this
  }

  #getGroupInstance = (group: MenuItemGroup<T, false>) => {
    const groupInstance = {
      group,
      addItem: (key: string, item: Omit<MenuItem<T>, 'key' | 'index'>) => {
        const data = { ...item, key } as MenuItem<T>
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
    const items: Omit<MenuItem<T>, 'index'>[] = []
    const group: MenuItemGroup<T, false> = {
      key,
      label,
      items,
    }
    this.#groups.push(group)

    return this.#getGroupInstance(group)
  }

  getGroup = (key: string) => {
    const group = this.#groups.find((group) => group.key === key)
    if (!group) throw new Error(`Group with key ${key} not found`)

    return this.#getGroupInstance(group)
  }

  build = () => {
    return this.#groups
  }
}

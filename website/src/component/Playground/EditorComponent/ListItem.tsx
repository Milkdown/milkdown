/* Copyright 2021, Milkdown by Mirone. */
import { useNodeViewContext } from '@prosemirror-adapter/react'
import type { FC } from 'react'

import './ListItem.css'

export const ListItem: FC = () => {
  const { contentRef, node, setAttrs, selected } = useNodeViewContext()
  const { attrs } = node
  const checked = attrs?.checked
  const isBullet = attrs?.listType === 'bullet'
  return (
    <li className={['flex flex-column items-start gap-2', selected ? 'ProseMirror-selectednode' : ''].join(' ')}>
      <span className="flex h-6 items-center">
        {
        checked != null
          ? <input className="form-checkbox rounded" onChange={() => setAttrs({ checked: !checked }) } type="checkbox" checked={checked} />
          : isBullet
            ? <span className="bg-nord8 dark:bg-nord9 h-2 w-2 rounded-full" />
            : <span className="text-nord8">{attrs?.label}</span>
      }
      </span>
      <div className="min-w-0" ref={contentRef} />
    </li>
  )
}

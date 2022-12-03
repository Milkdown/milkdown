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
      <span className="h-6 flex items-center">
      {
        checked != null
          ? <input className="form-checkbox rounded" onChange={() => setAttrs({ checked: !checked }) } type="checkbox" checked={checked} />
          : isBullet
            ? <span className="w-2 h-2 bg-blue-400 rounded-full" />
            : <span className="text-blue-400">{attrs?.label}</span>
      }
      </span>
      <div className="min-w-0" ref={contentRef} />
    </li>
  )
}

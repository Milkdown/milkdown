/* Copyright 2021, Milkdown by Mirone. */
import { useNodeViewContext } from '@prosemirror-adapter/react'
import type { FC } from 'react'

export const FootnoteRef: FC = () => {
  const { node } = useNodeViewContext()
  const label = node.attrs.label

  return (
    <sup>
      <a id={`footnote-${label}-ref`} className="text-nord8" href={`#footnote-${label}-def`}>{label}</a>
    </sup>
  )
}

export const FootnoteDef: FC = () => {
  const { node, contentRef } = useNodeViewContext()
  const label = node.attrs.label
  return (
    <dl className="flex gap-2 bg-gray-50 border-gray-300 border-2 rounded p-3 relative" id={`footnote-${label}-def`}>
      <dt className="text-nord8">
        {label}:
      </dt>
      <dd className="min-w-0 not-prose" ref={contentRef} />
      <div contentEditable="false" suppressContentEditableWarning className="absolute top-0 right-0 cursor-pointer">
        <a className="text-nord8 p-2" href={`#footnote-${label}-ref`}>↩</a>
      </div>
    </dl>
  )
}

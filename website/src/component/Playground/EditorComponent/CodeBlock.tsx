/* Copyright 2021, Milkdown by Mirone. */
import { useNodeViewContext } from '@prosemirror-adapter/react'
import type { FC } from 'react'

const langs = ['text', 'typescript', 'javascript', 'html', 'css', 'json', 'markdown']

export const CodeBlock: FC = () => {
  const { contentRef, selected, node, setAttrs } = useNodeViewContext()
  return (
    <div className={[selected ? 'ProseMirror-selectednode' : '', 'not-prose rounded my-4 bg-gray-200 p-5 shadow'].join(' ')}>
      <div contentEditable="false" suppressContentEditableWarning className="mb-2 flex justify-between">
        <select
          className="!focus:shadow-none cursor-pointer rounded !border-0 shadow-sm focus:ring-2 focus:ring-offset-2"
          value={node.attrs.language || 'text'}
          onChange={(e) => {
            setAttrs({ language: e.target.value })
          }}>
          {langs.map(lang => <option value={lang} key={lang}>{lang}</option>)}
        </select>

        <button
          className="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-base font-medium leading-6 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2"
          onClick={(e) => {
            e.preventDefault()
            navigator.clipboard.writeText(node.textContent)
          }}
        >
          Copy
        </button>
      </div>
      <pre className="!m-0 !mb-4">
        <code ref={contentRef} />
      </pre>
    </div>
  )
}

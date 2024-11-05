import type { Meta, StoryObj } from '@storybook/html'
import { collab, collabServiceCtx } from '@milkdown/kit/plugin/collab'
import * as Y from 'yjs'

import type { CommonArgs } from '../utils/shadow'
import { setupMilkdown } from '../utils/shadow'
import style from './collab.css?inline'
import { Editor, EditorStatus } from '@milkdown/kit/core'

const meta: Meta = {
  title: 'Plugins/Collab',
}

export default meta

export const Table: StoryObj<CommonArgs> = {
  render: (args) => {
    const root = document.createElement('div')

    const doc1 = new Y.Doc();
    let instance1: Editor
    const editor1 = setupMilkdown([style], args, (editor) => {
      editor.use(collab)
      instance1 = editor
    })
    instance1!.onStatusChange((status) => {
      if(status === EditorStatus.Created) {
        instance1!.action((ctx) => {
          const collabService = ctx.get(collabServiceCtx)
          collabService
            // bind doc
            .bindDoc(doc1)
            // connect yjs with milkdown
            .connect()
        })
      }
    })


    const doc2 = new Y.Doc();
    let instance2: Editor
    const editor2 = setupMilkdown([style], args, (editor) => {
      editor.use(collab)
      instance2 = editor
    })
    instance2!.onStatusChange((status) => {
      if(status === EditorStatus.Created) {
        instance2!.action((ctx) => {
          const collabService = ctx.get(collabServiceCtx)
          collabService
            // bind xml fragment
            .bindXmlFragment(doc2.getXmlFragment('prosemirror'))
            // connect yjs with milkdown
            .connect()
        })
      }
    })

    doc1.on('update', (update, origin) => {
      if(origin !== doc2) {
        Y.applyUpdate(doc2, update, doc1)
      }
    })
    doc2.on('update', (update, origin) => {
      if(origin !== doc1) {
        Y.applyUpdate(doc1, update, doc2)
      }
    })


    root.appendChild(editor1)
    root.appendChild(editor2)

    return root
  },
  args: {
    readonly: false,
    defaultValue: '',
  },
}

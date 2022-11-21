<script lang="ts">
import { effect, ref } from 'vue'
import { VueEditor, useEditor } from '@milkdown/vue'
import type { Node } from '@milkdown/prose/model'
</script>

<script lang="ts" setup>
import { Editor, defaultValueCtx, editorCtx, rootCtx } from '@milkdown/core'
import { nord } from '@milkdown/theme-nord'
import { codeFence as cmCodeFence, commonmark } from '@milkdown/preset-commonmark'
import { emoji } from '@milkdown/plugin-emoji'
import { prism } from '@milkdown/plugin-prism'
import { menu } from '@milkdown/plugin-menu'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { codeFence } from './CodeFence/CodeFence'
import CodeFence from './CodeFence/CodeFence.vue'

const editorRef = ref<Editor | null>(null)
const mounted = ref(false)

effect(() => {
  if (mounted.value && editorRef.value) {
    mounted.value = true
    editorRef.value.action(() => {
      // you can provide action here
    })
  }
})

const value = `
# Milkdown 💖 Vue
\`\`\`typescript [Source]
const foo = 'bar';
\`\`\`
`

const { editor } = useEditor((root, renderVue) =>
  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, value)
      ctx.get(listenerCtx)
        .mounted((ctx) => {
          editorRef.value = ctx.get(editorCtx)
          mounted.value = true
        })
        .markdownUpdated((_, markdown) => {
          // eslint-disable-next-line no-console
          console.log(markdown)
        })
    })
    .use(nord)
    .use(emoji)
    .use(commonmark.replace(cmCodeFence, codeFence(renderVue<Node>(CodeFence))()))
    .use(prism)
    .use(menu)
    .use(listener),
)
</script>

<template>
  <VueEditor :editor="editor" />
</template>

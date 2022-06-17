<script lang="ts">
import { defineComponent } from 'vue';
import { VueEditor, useEditor } from '@milkdown/vue';
import { Node } from '@milkdown/prose/model';
import { EditorRef } from '@milkdown/vue/lib/EditorComponent';

export default defineComponent({
    name: 'Milkdown',
    components: {
        VueEditor,
    },
});
</script>
<script lang="ts" setup>
import { effect, ref } from 'vue';
import { Editor, rootCtx, defaultValueCtx, editorCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { codeFence as cmCodeFence, commonmark } from '@milkdown/preset-commonmark';
import { emoji } from '@milkdown/plugin-emoji';
import { prism } from '@milkdown/plugin-prism';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { codeFence } from './CodeFence/CodeFence';
import CodeFence from './CodeFence/CodeFence.vue';

const editorRef = ref<Editor | null>(null);
const mounted = ref(false);

effect(() => {
    if (mounted.value && editorRef.value) {
        mounted.value = true;
        editorRef.value.action((ctx) => {
            ctx;
            // console.log(ctx.get(editorStateCtx).doc);
            // your action here
        });
    }
});

const value = `
# Milkdown 💖 Vue
\`\`\`typescript [Source]
const foo = 'bar';
\`\`\`
`;

const testRef = ref({
    get: () => {},
    dom: () => {},
} as EditorRef);

const { editor, loading, getInstance, getDom } = useEditor((root, renderVue) =>
    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, value);
            ctx.get(listenerCtx)
                .mounted((ctx) => {
                    editorRef.value = ctx.get(editorCtx);
                    mounted.value = true;
                })
                .markdownUpdated((_, markdown) => {
                    console.log(markdown);
                });
        })
        .use(nord)
        .use(emoji)
        .use(commonmark.replace(cmCodeFence, codeFence(renderVue<Node>(CodeFence))()))
        .use(prism)
        .use(listener),
);

effect(() => {
    if (!loading.value) {
        getInstance()?.action((ctx) => {
            ctx;
            console.log(getDom());
        });
        testRef.value.get()?.action(() => {
            console.log(testRef.value.dom());
        });
    }
});
</script>

<template>
    <VueEditor :editor="editor" :editor-ref="testRef" />
</template>

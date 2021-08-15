import { DefineComponent, defineComponent, inject, ref, h } from 'vue';
import { commonmarkNodes, commonmarkPlugins, paragraph, image } from '@milkdown/preset-commonmark';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { EditorRef, useEditor, VueEditor, nodeMetadata } from '../src';

const MyParagraph: DefineComponent = defineComponent({
    name: 'my-paragraph',
    setup(_, { slots }) {
        return () => <div class="my-paragraph">{slots.default?.()}</div>;
    },
});
// const MyParagraph = defineComponent((_, ctx) => {
//     return () => (
//         <div class="my-paragraph">
//             <div class="lalala">{ctx.slots.default?.() ?? []}</div>
//         </div>
//     );
// });
const MyImage: DefineComponent = defineComponent({
    name: 'my-image',
    setup() {
        const node = inject(nodeMetadata)?.node;
        return () => <img class="image" src={node?.attrs.src} alt={node?.attrs.alt} />;
    },
});

export const MyEditor = defineComponent((props: { markdown: string }) => {
    const editorRef = ref<EditorRef>({ get: () => undefined, dom: () => null });
    const editor = useEditor((root, renderVue) => {
        const nodes = commonmarkNodes
            .configure(paragraph, {
                view: renderVue(MyParagraph),
            })
            .configure(image, {
                view: renderVue(MyImage),
            });
        // setTimeout(() => {
        //     console.log(editorRef.value.get());
        // }, 100);
        return new Editor()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, props.markdown);
            })
            .use(nodes)
            .use(commonmarkPlugins);
    });

    return () => <VueEditor editorRef={editorRef} editor={editor} />;
});
MyEditor.props = ['markdown'];

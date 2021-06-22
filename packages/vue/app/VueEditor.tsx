import { DefineComponent, defineComponent, inject } from 'vue';
import { commonmark, Paragraph, Image } from '@milkdown/preset-commonmark';
import { Editor } from '@milkdown/core';
import { Node } from 'prosemirror-model';
import { useEditor, VueEditor } from '../src';

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
        const node: Node = inject('node', {} as Node);
        return () => <img class="image" src={node?.attrs.src} alt={node?.attrs.alt} />;
    },
});

export const MyEditor = defineComponent((props: { markdown: string }) => {
    const editor = useEditor((root, renderVue) => {
        const nodes = commonmark
            .configure(Paragraph, {
                view: renderVue(MyParagraph),
            })
            .configure(Image, {
                view: renderVue(MyImage),
            });
        return new Editor({
            root,
            defaultValue: props.markdown || '',
        }).use(nodes);
    });

    return () => <VueEditor editor={editor} />;
});
MyEditor.props = ['markdown'];

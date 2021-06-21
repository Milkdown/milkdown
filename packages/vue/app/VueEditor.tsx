import { DefineComponent, defineComponent, inject } from 'vue';
import { commonmark, Paragraph, Image } from '@milkdown/preset-commonmark';
import { Editor } from '@milkdown/core';
import { Node } from 'prosemirror-model';
import { useGetEditor, VueEditor } from '../src';

const MyParagraph = defineComponent({
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
const MyImage = defineComponent({
    name: 'my-image',
    setup() {
        const node: Node | undefined = inject('node');
        return () => <img class="image" src={node?.attrs.src} alt={node?.attrs.alt} />;
    },
});

export const MyEditor = defineComponent((props: { markdown: string }) => {
    const editor = useGetEditor((root, renderVue) => {
        const nodes = commonmark
            .configure(Paragraph, {
                view: renderVue(MyParagraph as DefineComponent),
            })
            .configure(Image, {
                view: renderVue(MyImage as DefineComponent),
            });
        return new Editor({
            root,
            defaultValue: props.markdown || '',
        }).use(nodes);
    });

    return () => <VueEditor editor={editor} />;
});
MyEditor.props = ['markdown'];

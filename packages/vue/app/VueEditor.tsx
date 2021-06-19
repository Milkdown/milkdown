import { ref, defineComponent, onMounted } from 'vue';
import { commonmark } from '@milkdown/preset-commonmark';
import { Editor } from '@milkdown/core';

export const VueEditor = defineComponent({
    props: {
        markdown: String,
    },
    setup(props) {
        const root = ref(null);

        onMounted(() => {
            new Editor({
                root: root.value,
                defaultValue: props.markdown || '',
            })
                .use(commonmark)
                .create();
        });

        return () => <div ref={root} />;
    },
});

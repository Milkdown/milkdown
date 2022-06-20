/* Copyright 2021, Milkdown by Mirone. */
import { Editor } from '@milkdown/core';
import { defineComponent, h, inject } from 'vue';

import { editorInfoCtxKey } from './Editor';
import { EditorInfoCtx, GetEditor } from './types';
import { useGetEditor } from './useGetEditor';

export const EditorComponent = defineComponent<{ editor: GetEditor; editorRef?: EditorRef }>({
    name: 'milkdown-dom-root',
    setup: (props, { slots }) => {
        useGetEditor(props.editor);
        const ctx = inject(editorInfoCtxKey, {} as EditorInfoCtx);

        if (props.editorRef) {
            props.editorRef.get = () => ctx.editor.value;
            props.editorRef.dom = () => ctx.dom.value;
        }

        return () => <div ref={ctx.dom}>{slots['default']?.()}</div>;
    },
});
EditorComponent['props'] = ['editor', 'editorRef'];

export type EditorRef = { get: () => Editor | undefined; dom: () => HTMLDivElement | null };

/* Copyright 2021, Milkdown by Mirone. */
import { forwardRef, useContext, useImperativeHandle } from 'react';

import { EditorRef, GetEditor } from './types';
import { editorInfoContext, useGetEditor } from './useGetEditor';

export const useGetter = () => {
    const ctx = useContext(editorInfoContext);
    return {
        get: () => {
            return ctx.editor.current;
        },
        dom: () => {
            return ctx.dom.current;
        },
    };
};

export const EditorComponent = forwardRef<EditorRef, { editor: GetEditor }>(({ editor }, ref) => {
    const ctx = useContext(editorInfoContext);
    const getter = useGetter();
    useGetEditor(editor);

    useImperativeHandle(ref, () => getter);
    return <div ref={ctx.dom} />;
});

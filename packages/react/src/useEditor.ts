/* Copyright 2021, Milkdown by Mirone. */
import { Editor } from '@milkdown/core';
import { DependencyList, useCallback, useRef, useState } from 'react';

import { GetEditor, UseEditorReturn } from './types';

export const useEditor = (getEditor: GetEditor, deps: DependencyList = []): UseEditorReturn => {
    const dom = useRef<HTMLDivElement>(null);
    const editor = useRef<Editor>();
    const [loading, setLoading] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getEditorCallback = useCallback<GetEditor>((...args) => getEditor(...args), deps);

    return {
        loading,
        getInstance: () => editor.current,
        getDom: () => dom.current,
        editor: {
            getEditorCallback,
            dom,
            editor,
            setLoading,
        },
    };
};

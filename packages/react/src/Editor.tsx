/* Copyright 2021, Milkdown by Mirone. */
import { Mark, Node } from '@milkdown/prose/model';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';

import { EditorComponent } from './EditorComponent';
import { portalContext } from './Portals';
import { createReactView } from './ReactNodeView';
import { EditorInfo, EditorInfoCtx, EditorRef, RenderReact } from './types';
import { editorInfoContext } from './useGetEditor';

type EditorProps = {
    editor: EditorInfo;
};

const refDeprecatedInfo = `
@milkdown/react:
Passing ref to ReactEditor will soon be deprecated, please use:

const { editor, getInstance, getDom, loading } = useEditor(/* creator */);

useEffect(() => {
    if (!loading) {
        const editor = getInstance();
        const rootDOM = getDom();
    }
}, [getInstance])

<ReactEditor editor={editor} />
`;

const hooksDeprecatedInfo = `
@milkdown/react:
Passing editor directly to ReactEditor will soon be deprecated, please use:

const { editor } = useEditor(/* creator */);

<ReactEditor editor={editor} />
`;

export const ReactEditor = forwardRef<EditorRef, EditorProps>(({ editor: editorInfo }, ref) => {
    const [portals, setPortals] = useState<React.ReactPortal[]>([]);
    const addPortal = useCallback((portal: React.ReactPortal) => {
        setPortals((ps) => [...ps, portal]);
    }, []);
    const removePortalByKey = useCallback((key: string) => {
        setPortals((x) => {
            const index = x.findIndex((p) => p.key === key);

            return [...x.slice(0, index), ...x.slice(index + 1)];
        });
    }, []);
    const renderReact: RenderReact<Node | Mark> = useCallback(
        (Component, options) => createReactView(addPortal, removePortalByKey)(Component, options),
        [addPortal, removePortalByKey],
    );

    const usingDeprecatedHooksAPI = Object.hasOwnProperty.call(editorInfo, 'getInstance');

    const { getEditorCallback, dom, editor, setLoading } = usingDeprecatedHooksAPI
        ? // @ts-expect-error deprecated old hooks API
          (editorInfo.editor as EditorInfo)
        : editorInfo;

    useEffect(() => {
        if (usingDeprecatedHooksAPI) {
            console.warn(hooksDeprecatedInfo);
        }
        if (ref) {
            console.warn(refDeprecatedInfo);
        }
    }, [ref, usingDeprecatedHooksAPI]);

    const ctx = useMemo<EditorInfoCtx>(() => {
        return {
            dom,
            editor,
            setLoading,
        };
    }, [dom, editor, setLoading]);

    return (
        <editorInfoContext.Provider value={ctx}>
            <portalContext.Provider value={renderReact}>
                {portals}
                <EditorComponent ref={ref} editor={getEditorCallback} />
            </portalContext.Provider>
        </editorInfoContext.Provider>
    );
});

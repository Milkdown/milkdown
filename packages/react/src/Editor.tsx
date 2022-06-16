/* Copyright 2021, Milkdown by Mirone. */
import { Mark, Node } from '@milkdown/prose/model';
import { forwardRef, useCallback, useMemo, useState } from 'react';

import { EditorComponent } from './EditorComponent';
import { portalContext } from './Portals';
import { createReactView } from './ReactNodeView';
import { EditorInfo, EditorInfoCtx, EditorRef, RenderReact } from './types';
import { editorInfoContext } from './useGetEditor';

type EditorProps = {
    editor: EditorInfo;
};

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

    const { getEditorCallback, dom, editor, setLoading } = editorInfo;
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

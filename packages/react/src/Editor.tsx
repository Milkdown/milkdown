/* Copyright 2021, Milkdown by Mirone. */
import { forwardRef, ReactNode, useCallback, useMemo, useState } from 'react';

import { EditorComponent } from './EditorComponent';
import { portalContext, Portals } from './Portals';
import { createReactView, RenderOptions } from './ReactNodeView';
import { EditorInfo, EditorInfoCtx, EditorRef } from './types';
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
    const renderReact = useCallback(
        (Component: React.FC<{ children: ReactNode }>, options?: RenderOptions) =>
            createReactView(addPortal, removePortalByKey)(Component, options),
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
                <Portals portals={portals} />
                <EditorComponent ref={ref} editor={getEditorCallback} />
            </portalContext.Provider>
        </editorInfoContext.Provider>
    );
});

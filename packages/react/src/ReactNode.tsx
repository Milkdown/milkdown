/* Copyright 2021, Milkdown by Mirone. */
import { Editor } from '@milkdown/core';
import { Mark, Node } from 'prosemirror-model';
import { Decoration, EditorView } from 'prosemirror-view';
import React from 'react';

type NodeContext = {
    editor: Editor;
    node: Node | Mark;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

const nodeContext = React.createContext<NodeContext>({
    editor: undefined,
    node: undefined,
    view: undefined,
    getPos: undefined,
    decorations: undefined,
} as unknown as NodeContext);

export const ReactNodeContainer: React.FC<NodeContext> = ({ editor, node, view, getPos, decorations, children }) => {
    return <nodeContext.Provider value={{ editor, node, view, getPos, decorations }}>{children}</nodeContext.Provider>;
};

export const useNodeCtx = () => React.useContext(nodeContext);

export const Content: React.FC<{ isMark?: boolean; dom?: HTMLElement | null }> = ({ dom, isMark }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const { current } = containerRef;
        if (!current || !dom) return;

        current.appendChild(dom);
    }, [dom]);

    if (isMark) {
        return <span className="content-dom-wrapper" ref={containerRef} />;
    }

    return <div className="content-dom-wrapper" ref={containerRef} />;
};

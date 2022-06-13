/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { Mark, Node } from '@milkdown/prose/model';
import { Decoration, EditorView } from '@milkdown/prose/view';
import React, { ReactNode } from 'react';

type NodeContext = {
    ctx: Ctx;
    node: Node | Mark;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: readonly Decoration[];
};

const nodeContext = React.createContext<NodeContext>({
    ctx: undefined,
    node: undefined,
    view: undefined,
    getPos: undefined,
    decorations: undefined,
} as unknown as NodeContext);

export const ReactNodeContainer: React.FC<NodeContext & { children: ReactNode }> = ({
    ctx,
    node,
    view,
    getPos,
    decorations,
    children,
}) => {
    return <nodeContext.Provider value={{ ctx, node, view, getPos, decorations }}>{children}</nodeContext.Provider>;
};

export const useNodeCtx = () => React.useContext(nodeContext);

export const Content: React.FC<{ isInline?: boolean; dom?: HTMLElement | null }> = ({ dom, isInline }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const { current } = containerRef;
        if (!current || !dom) return;

        current.appendChild(dom);
    }, [dom]);

    if (isInline) {
        return <span className="content-dom-wrapper" ref={containerRef} />;
    }

    return <div className="content-dom-wrapper" ref={containerRef} />;
};

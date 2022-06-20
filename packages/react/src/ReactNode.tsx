/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { Mark, Node } from '@milkdown/prose/model';
import { Decoration, EditorView } from '@milkdown/prose/view';
import { createContext, FC, ReactNode, useContext } from 'react';

type NodeContext<T extends Node | Mark = Node | Mark> = {
    ctx: Ctx;
    node: T;
    view: EditorView;
    getPos: T extends Mark ? boolean : T extends Node ? () => number : boolean | (() => number);
    decorations: readonly Decoration[];
};

const nodeContext = createContext<NodeContext>({
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

export type UseNodeCtx = <T extends Node | Mark = Node | Mark>() => NodeContext<T>;
export const useNodeCtx: UseNodeCtx = (() => useContext(nodeContext)) as UseNodeCtx;

export const Content: FC<{ isInline?: boolean; contentRef: (dom: HTMLElement | null) => void }> = ({
    contentRef,
    isInline,
}) => {
    if (isInline) {
        return <span data-view-content className="content-dom-wrapper" ref={contentRef} />;
    }

    return <div data-view-content className="content-dom-wrapper" ref={contentRef} />;
};

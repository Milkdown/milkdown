/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';
import { createContext, FC, memo, ReactNode, ReactPortal } from 'react';

export const portalContext = createContext<
    (Component: FC<{ children: ReactNode }>) => (ctx: Ctx) => NodeViewConstructor | MarkViewConstructor
>(() => () => {
    throw new Error();
});

const getId = (portals: ReactPortal[]) => portals.map((x) => x.key).join(',');
export const Portals: FC<{ portals: ReactPortal[] }> = memo(
    ({ portals }) => {
        return <>{portals}</>;
    },
    (prev, next) => {
        return getId(prev.portals) === getId(next.portals);
    },
);

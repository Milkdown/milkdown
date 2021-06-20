import React from 'react';
import type { NodeViewFactory } from '@milkdown/core';

export const portalContext = React.createContext<(Component: React.FC) => NodeViewFactory>(() => () => {
    throw new Error();
});

const getId = (portals: React.ReactPortal[]) => portals.map((x) => x.key).join(',');
export const Portals: React.FC<{ portals: React.ReactPortal[] }> = React.memo(
    ({ portals }) => <>{...portals}</>,
    (prev, next) => {
        return getId(prev.portals) === getId(next.portals);
    },
);

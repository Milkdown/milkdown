import React from 'react';
import type { NodeViewFactory } from '@milkdown/core';

export const portalContext = React.createContext<(Component: React.FC) => NodeViewFactory>(() => {
    return () => {
        throw new Error();
    };
});

export const Portals: React.FC<{ portals: React.ReactPortal[] }> = React.memo(
    ({ portals }) => {
        return <>{...portals}</>;
    },
    (prev, next) => {
        const getId = (portals: React.ReactPortal[]) => portals.map((x) => x.key).join(',');
        return getId(prev.portals) === getId(next.portals);
    },
);

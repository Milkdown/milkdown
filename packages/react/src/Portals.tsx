/* Copyright 2021, Milkdown by Mirone. */
import type { ViewFactory } from '@milkdown/core';
import React from 'react';

export const portalContext = React.createContext<(Component: React.FC) => ViewFactory>(() => () => {
    throw new Error();
});

const getId = (portals: React.ReactPortal[]) => portals.map((x) => x.key).join(',');
export const Portals: React.FC<{ portals: React.ReactPortal[] }> = React.memo(
    ({ portals }) => {
        return <>{...portals}</>;
    },
    (prev, next) => {
        return getId(prev.portals) === getId(next.portals);
    },
);

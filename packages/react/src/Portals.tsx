/* Copyright 2021, Milkdown by Mirone. */
import { createContext, FC, memo, ReactPortal } from 'react';

import { RenderReact } from './types';

export const portalContext = createContext<RenderReact>(() => () => {
    throw new Error();
});

export const Portals: FC<{ portals: ReactPortal[] }> = memo(({ portals }) => {
    return <>{portals}</>;
});

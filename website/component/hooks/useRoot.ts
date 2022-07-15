/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';

import { i18nConfig } from '../../route';
import { localCtx } from '../Context';

export const useRoot = () => {
    const local = React.useContext(localCtx);
    return React.useMemo(() => i18nConfig[local].route, [local]);
};

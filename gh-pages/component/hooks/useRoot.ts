import React from 'react';
import { localCtx } from '../Context';

export const useRoot = () => {
    const local = React.useContext(localCtx);
    return React.useMemo(() => (local === 'en' ? '' : local), [local]);
};

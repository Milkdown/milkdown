/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';

import { displaySidebarCtx } from '../Context';
import { LocationType, useLocationType } from './useLocationType';

export const useHeaderInfo = () => {
    const [showToggle, setShowToggle] = React.useState(true);

    const fold = React.useContext(displaySidebarCtx);
    const [locationType] = useLocationType();

    React.useEffect(() => {
        if (locationType === LocationType.Page) {
            setShowToggle(true);
            return;
        }
        setShowToggle(false);
    }, [locationType]);

    return {
        showToggle,
        fold,
        isHomePage: locationType === LocationType.Home,
    };
};

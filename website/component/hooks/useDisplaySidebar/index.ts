/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';

import { setDisplaySidebarCtx } from '../../Context';
import { LocationType, useLocationType } from '../useLocationType';

export const useDisplaySidebar = () => {
    const setDisplay = React.useContext(setDisplaySidebarCtx);

    const [locationType, location] = useLocationType();

    React.useEffect(() => {
        const isSmallScreen = document.documentElement.clientWidth < 1080;
        if (locationType !== LocationType.Page || isSmallScreen) {
            setDisplay(false);
            return;
        }

        setDisplay(true);
    }, [locationType, setDisplay, location]);
};

import React from 'react';

import { setDisplaySidebarCtx } from '../../Context';
import { LocationType, useLocationType } from '../useLocationType';
import { resumeBodyScroll, scroll, stopBodyScroll } from './disable-body-scroll';

export const useDisplaySidebar = () => {
    const setDisplay = React.useContext(setDisplaySidebarCtx);

    const ref = React.useRef<HTMLDivElement>(null);
    const [locationType, location] = useLocationType();

    React.useEffect(() => {
        const isSmallScreen = document.documentElement.clientWidth < 1080;
        if (locationType !== LocationType.Page || isSmallScreen) {
            setDisplay(false);
            return;
        }

        setDisplay(true);
        const { current } = ref;
        if (!current) return;

        document.body.appendChild(scroll);
        current.addEventListener('mouseenter', stopBodyScroll);
        current.addEventListener('mouseleave', resumeBodyScroll);
        return () => {
            document.body.removeChild(scroll);
            current.removeEventListener('mouseleave', resumeBodyScroll);
            current.removeEventListener('mouseenter', stopBodyScroll);
        };
    }, [locationType, setDisplay, location]);

    return ref;
};

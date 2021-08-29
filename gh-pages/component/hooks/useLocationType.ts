/* Copyright 2021, Milkdown by Mirone. */
import { Location } from 'history';
import { useLocation } from 'react-router-dom';

import { useRoot } from './useRoot';

export enum LocationType {
    Home,
    Demo,
    Page,
}

const getType = (location: Location, root: string) => {
    if (location.pathname === '/' + root) {
        return LocationType.Home;
    }

    if (location.pathname === '/' + [root, 'online-demo'].filter((x) => x).join('/')) {
        return LocationType.Demo;
    }

    return LocationType.Page;
};

export function useLocationType(): [LocationType, Location] {
    const root = useRoot();
    const location = useLocation();

    return [getType(location, root), location];
}

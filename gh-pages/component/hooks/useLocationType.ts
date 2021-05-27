import { useLocation } from 'react-router-dom';

export enum LocationType {
    Home,
    Demo,
    Page,
}

export function useLocationType(): LocationType {
    const location = useLocation();

    if (location.pathname === '/') {
        return LocationType.Home;
    }

    if (location.pathname === '/online-demo') {
        return LocationType.Demo;
    }

    return LocationType.Page;
}

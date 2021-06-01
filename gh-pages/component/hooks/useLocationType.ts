import { useLocation } from 'react-router-dom';
import { Location } from 'history';

export enum LocationType {
    Home,
    Demo,
    Page,
}

const getType = (location: Location) => {
    if (location.pathname === '/') {
        return LocationType.Home;
    }

    if (location.pathname === '/online-demo') {
        return LocationType.Demo;
    }

    return LocationType.Page;
};

export function useLocationType(): [LocationType, Location] {
    const location = useLocation();

    return [getType(location), location];
}

import { useLocation } from 'react-router-dom';

export function useIsIndex() {
    const location = useLocation();

    return location.pathname === '/' || location.pathname === '/online-demo';
}

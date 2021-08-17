import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Main } from './Route';

import className from './style.module.css';
import { Context, displaySidebarCtx, setDisplaySidebarCtx, setLocalCtx } from './Context';
import { Local, i18nConfig } from '../route';

const Container: React.FC = () => {
    const setDisplaySidebar = React.useContext(setDisplaySidebarCtx);
    const displaySidebar = React.useContext(displaySidebarCtx);
    const setLocal = React.useContext(setLocalCtx);

    React.useEffect(() => {
        const path = window.location.hash.split('/').filter((x) => x && x !== '#');
        const [first] = path;
        const list = Object.values(i18nConfig)
            .map(({ route }) => route)
            .filter((x) => x);
        if (list.includes(first)) {
            setLocal(first as Local);
        }
    }, [setLocal]);

    return (
        <div
            onClick={() => {
                if (document.documentElement.clientWidth < 1142) {
                    setDisplaySidebar(false);
                }
            }}
            className={displaySidebar ? className.right : [className.right, className.fold].join(' ')}
        >
            <Header />
            <main className={className.main}>
                <Main />
            </main>
        </div>
    );
};

export const App: React.FC = () => (
    <HashRouter>
        <Context>
            <Sidebar />
            <Container />
        </Context>
    </HashRouter>
);

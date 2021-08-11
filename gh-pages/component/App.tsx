import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Main } from './Route';

import '@milkdown/theme-nord/lib/theme.css';
import className from './style.module.css';
import { Context, displaySidebarCtx, setDisplaySidebarCtx } from './Context';

const Container: React.FC = () => {
    const setDisplaySidebar = React.useContext(setDisplaySidebarCtx);
    const displaySidebar = React.useContext(displaySidebarCtx);

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

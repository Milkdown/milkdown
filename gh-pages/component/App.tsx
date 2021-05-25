import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { MilkdownEditor } from './MilkdownEditor/MilkdownEditor';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';

import className from './style.module.css';
import { data } from './data';

const copyright = 'MIT Licensed | Copyright © 2021-present Mirone Saul';

const pages = data.flatMap((section) => section.items);

export const App: React.FC = () => {
    const [displaySidebar, setDisplaySidebar] = React.useState(true);
    return (
        <HashRouter>
            <Header showToggle onToggle={() => setDisplaySidebar(!displaySidebar)} />
            <main className={className.main}>
                {displaySidebar && <Sidebar sections={data} />}
                <article>
                    <Switch>
                        {pages.map((page, i) => (
                            <Route key={i.toString()} path={page.link}>
                                <MilkdownEditor content={page.content} readOnly />
                            </Route>
                        ))}
                    </Switch>

                    <footer className={className.footer}>{copyright}</footer>
                </article>
            </main>
        </HashRouter>
    );
};

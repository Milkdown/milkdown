import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { Home } from './Home/Home';
import { MilkdownEditor } from './MilkdownEditor/MilkdownEditor';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { data } from './data';

import className from './style.module.css';
import example from '../example.md';

const copyright = 'MIT Licensed | Copyright © 2021-present Mirone Saul';

const pages = data.flatMap((section) => section.items);

export const App: React.FC = () => {
    const [displaySidebar, setDisplaySidebar] = React.useState(true);

    return (
        <HashRouter>
            <Header onToggle={() => setDisplaySidebar(!displaySidebar)} />
            <main className={className.main}>
                {displaySidebar && <Sidebar sections={data} />}
                <div className={className.container}>
                    <article>
                        <Switch>
                            <Route exact path="/">
                                <Home />
                            </Route>
                            <Route exact path="/online-demo">
                                <MilkdownEditor content={example} />
                            </Route>

                            {pages.map((page, i) => (
                                <Route key={i.toString()} path={page.link}>
                                    <MilkdownEditor content={page.content} readOnly />
                                </Route>
                            ))}
                        </Switch>
                    </article>
                    <footer className={className.footer}>{copyright}</footer>
                </div>
            </main>
        </HashRouter>
    );
};

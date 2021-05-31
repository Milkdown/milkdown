import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { Home } from './Home/Home';
import { MilkdownEditor } from './MilkdownEditor/MilkdownEditor';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { pageRouter } from './page-router';

import className from './style.module.css';
import demo from '../pages/demo.md';
import { Footer } from './Footer/Footer';

const pages = pageRouter.flatMap((section) => section.items);

export const App: React.FC = () => {
    const [displaySidebar, setDisplaySidebar] = React.useState(true);

    return (
        <HashRouter>
            <Header onToggle={() => setDisplaySidebar(!displaySidebar)} />
            <main className={className.main}>
                <Sidebar display={displaySidebar} setDisplay={setDisplaySidebar} sections={pageRouter} />
                <div className={className.container}>
                    <article>
                        <Switch>
                            <Route exact path="/">
                                <Home />
                            </Route>
                            <Route exact path="/online-demo">
                                <MilkdownEditor content={demo} />
                            </Route>

                            {pages.map((page, i) => (
                                <Route key={i.toString()} path={page.link}>
                                    <MilkdownEditor content={page.content} readOnly />
                                </Route>
                            ))}
                        </Switch>
                    </article>
                    <Footer />
                </div>
            </main>
        </HashRouter>
    );
};

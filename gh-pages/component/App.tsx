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
import { useLocationType, LocationType } from './hooks/useLocationType';

const pages = pageRouter.flatMap((section) => section.items);

export const Main: React.FC<{ setScrolled: (scrolled: boolean) => void }> = ({ setScrolled }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [locationType] = useLocationType();

    const classes = [className.container, locationType === LocationType.Home ? className.homepage : ''].join(' ');

    React.useEffect(() => {
        if (!containerRef.current) return;

        const { current } = containerRef;

        const scroll = (e: Event) => {
            const { target } = e;
            if (!(target instanceof HTMLDivElement)) {
                return;
            }
            const { scrollTop } = target;
            setScrolled(scrollTop > 0);
        };

        current.addEventListener('scroll', scroll);

        return () => {
            current.removeEventListener('scroll', scroll);
        };
    }, [setScrolled]);

    return (
        <div ref={containerRef} className={classes}>
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
    );
};

export const App: React.FC = () => {
    const [displaySidebar, setDisplaySidebar] = React.useState(true);
    const [scrolled, setScrolled] = React.useState(false);

    return (
        <HashRouter>
            <div className={className.body}>
                <Sidebar display={displaySidebar} setDisplay={setDisplaySidebar} sections={pageRouter} />
                <div className={className.right}>
                    <Header onToggle={() => setDisplaySidebar(!displaySidebar)} scrolled={scrolled} />
                    <main
                        className={className.main}
                        onClick={() => {
                            if (document.documentElement.clientWidth < 1080) {
                                setDisplaySidebar(false);
                            }
                        }}
                    >
                        <Main setScrolled={setScrolled} />
                    </main>
                </div>
            </div>
        </HashRouter>
    );
};

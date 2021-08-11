import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Loader from 'react-spinners/PuffLoader';
import { editorModeCtx, isDarkModeCtx, sectionsCtx, setScrolledCtx } from './Context';
import { Footer } from './Footer';
import { Home } from './Home';
import { LocationType, useLocationType } from './hooks/useLocationType';
import className from './style.module.css';

const Editor = React.lazy(() => import('./MilkdownEditor').then((module) => ({ default: module.MilkdownEditor })));
const Demo = React.lazy(() => import('./Demo').then((module) => ({ default: module.Demo })));

const useScroll = () => {
    const setScrolled = React.useContext(setScrolledCtx);
    React.useEffect(() => {
        const scroll = () => {
            setScrolled(window.pageYOffset > 0);
        };

        document.addEventListener('scroll', scroll);

        return () => {
            document.removeEventListener('scroll', scroll);
        };
    }, [setScrolled]);
};

export const Main: React.FC = () => {
    const [locationType] = useLocationType();
    const editorMode = React.useContext(editorModeCtx);
    const isDarkMode = React.useContext(isDarkModeCtx);
    const sections = React.useContext(sectionsCtx);

    const classes = [className.container, locationType === LocationType.Home ? className.homepage : ''].join(' ');

    useScroll();

    const pages = sections.flatMap((section) => section.items);

    return (
        <div className={classes}>
            <article>
                <Switch>
                    <React.Suspense
                        fallback={
                            <div className={className.loading}>
                                <Loader color={'rgba(var(--primary), 1)'} loading size={150} />
                            </div>
                        }
                    >
                        <Route exact path="/">
                            <Home />
                        </Route>

                        <Route exact path="/online-demo">
                            <Demo mode={editorMode} isDarkMode={isDarkMode} />
                        </Route>

                        {pages.map((page, i) => (
                            <Route key={i.toString()} path={page.link}>
                                <Editor content={page.content} readOnly />
                            </Route>
                        ))}
                    </React.Suspense>
                </Switch>
            </article>
            <Footer />
        </div>
    );
};

/* Copyright 2021, Milkdown by Mirone. */
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Loader from 'react-spinners/PuffLoader';

import { editorModeCtx, isDarkModeCtx, sectionsCtx, setScrolledCtx } from './Context';
import { Footer } from './Footer';
import { Home } from './Home';
import { LocationType, useLocationType } from './hooks/useLocationType';
import { useRoot } from './hooks/useRoot';
import className from './style.module.css';

const Editor = React.lazy(() =>
    import('./MilkdownEditor/MilkdownEditor').then((module) => ({ default: module.MilkdownEditor })),
);
const Demo = React.lazy(() => import('./Demo/Demo').then((module) => ({ default: module.Demo })));

const Loading: React.FC = ({ children }) => (
    <React.Suspense
        fallback={
            <div className={className.loading}>
                <Loader color={'rgba(var(--primary), 1)'} loading size={150} />
            </div>
        }
    >
        {children}
    </React.Suspense>
);

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

    const root = useRoot();

    return (
        <div className={classes}>
            <article>
                <Routes>
                    <Route
                        path={'/' + root}
                        element={
                            <Loading>
                                <Home />
                            </Loading>
                        }
                    />

                    <Route
                        path={'/' + [root, 'online-demo'].filter((x) => x).join('/')}
                        element={
                            <Loading>
                                <Demo mode={editorMode} isDarkMode={isDarkMode} />
                            </Loading>
                        }
                    />

                    {pages.map((page, i) => (
                        <Route
                            key={i.toString()}
                            path={page.link}
                            element={
                                <Loading>
                                    <Editor content={page.content} readOnly />
                                </Loading>
                            }
                        />
                    ))}
                </Routes>
            </article>
            <Footer />
        </div>
    );
};

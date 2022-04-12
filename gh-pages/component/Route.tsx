/* Copyright 2021, Milkdown by Mirone. */
import { FC, lazy, ReactNode, Suspense, useContext, useEffect, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import Loader from 'react-spinners/PuffLoader';

import { editorModeCtx, isDarkModeCtx, sectionsCtx, setScrolledCtx } from './Context';
import { Footer } from './Footer';
import { Home } from './Home';
import { LocationType, useLocationType } from './hooks/useLocationType';
import { useRoot } from './hooks/useRoot';
import className from './style.module.css';

const Editor = lazy(() =>
    import('./MilkdownEditor/MilkdownEditor').then((module) => ({ default: module.MilkdownEditor })),
);
const Demo = lazy(() => import('./Demo/Demo').then((module) => ({ default: module.Demo })));

const Loading: FC<{ children: ReactNode }> = ({ children }) => (
    <Suspense
        fallback={
            <div className={className['loading']}>
                <Loader color={'rgba(var(--primary), 1)'} loading size={150} />
            </div>
        }
    >
        {children}
    </Suspense>
);

const useScroll = () => {
    const setScrolled = useContext(setScrolledCtx);
    useEffect(() => {
        const scroll = () => {
            setScrolled(window.pageYOffset > 0);
        };

        document.addEventListener('scroll', scroll);

        return () => {
            document.removeEventListener('scroll', scroll);
        };
    }, [setScrolled]);
};

export const Main: FC = () => {
    const [locationType] = useLocationType();
    const editorMode = useContext(editorModeCtx);
    const isDarkMode = useContext(isDarkModeCtx);
    const sections = useContext(sectionsCtx);

    const classes = useMemo(
        () => [className['container'], locationType === LocationType.Home ? className['homepage'] : ''].join(' '),
        [locationType],
    );

    useScroll();

    const pages = useMemo(() => sections.flatMap((section) => section.items), [sections]);

    const root = useRoot();

    return (
        <div className={classes}>
            <div className={className['content']}>
                <Routes>
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

                    <Route
                        path={'/' + [root, 'online-demo'].filter((x) => x).join('/')}
                        element={
                            <Loading>
                                <Demo mode={editorMode} isDarkMode={isDarkMode} />
                            </Loading>
                        }
                    />

                    <Route
                        path={'/' + root}
                        element={
                            <Loading>
                                <Home />
                            </Loading>
                        }
                    />
                </Routes>
            </div>
            <Footer />
        </div>
    );
};

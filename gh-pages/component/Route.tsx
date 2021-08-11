import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Loader from 'react-spinners/PuffLoader';
import { Local } from '../route';
import { Mode } from './constant';
import { Footer } from './Footer/Footer';
import { Home } from './Home/Home';
import { LocationType, useLocationType } from './hooks/useLocationType';
import { Section } from './Sidebar/Sidebar';
import className from './style.module.css';

const Editor = React.lazy(() =>
    import('./MilkdownEditor/MilkdownEditor').then((module) => ({ default: module.MilkdownEditor })),
);
const Demo = React.lazy(() => import('./Demo/Demo').then((module) => ({ default: module.Demo })));

export const Main: React.FC<{
    local: Local;
    setScrolled: (scrolled: boolean) => void;
    editorMode: Mode;
    isDarkMode: boolean;
    sections: Section[];
}> = ({ setScrolled, isDarkMode, editorMode, sections }) => {
    const [locationType] = useLocationType();

    const classes = [className.container, locationType === LocationType.Home ? className.homepage : ''].join(' ');

    React.useEffect(() => {
        const scroll = () => {
            setScrolled(window.pageYOffset > 0);
        };

        document.addEventListener('scroll', scroll);

        return () => {
            document.removeEventListener('scroll', scroll);
        };
    }, [setScrolled]);

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

import React from 'react';
import { HashRouter } from 'react-router-dom';
import { Header } from './Header/Header';
import { Sidebar } from './Sidebar/Sidebar';
import { pageRouter } from '../page-router';
import { Main } from './Route';

import '@milkdown/theme-nord/lib/theme.css';
import className from './style.module.css';
import { Mode } from './constant';

export const App: React.FC = () => {
    const [displaySidebar, setDisplaySidebar] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);
    const [editorMode, setEditorMode] = React.useState(Mode.Default);
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    return (
        <HashRouter>
            <>
                <Sidebar display={displaySidebar} setDisplay={setDisplaySidebar} sections={pageRouter} />
                <div
                    onClick={() => {
                        if (document.documentElement.clientWidth < 1142) {
                            setDisplaySidebar(false);
                        }
                    }}
                    className={displaySidebar ? className.right : [className.right, className.fold].join(' ')}
                >
                    <Header
                        fold={displaySidebar}
                        isDarkMode={isDarkMode}
                        setIsDarkMode={setIsDarkMode}
                        onEditorModeToggle={() =>
                            setEditorMode(editorMode === Mode.Default ? Mode.TwoSide : Mode.Default)
                        }
                        onToggle={() => setDisplaySidebar(!displaySidebar)}
                        scrolled={scrolled}
                        editorMode={editorMode}
                    />
                    <main className={className.main}>
                        <Main isDarkMode={isDarkMode} setScrolled={setScrolled} editorMode={editorMode} />
                    </main>
                </div>
            </>
        </HashRouter>
    );
};

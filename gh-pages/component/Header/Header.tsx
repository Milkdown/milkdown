import React from 'react';

import './style.css';

type Props = {
    showToggle: boolean;
};

export const Header: React.FC<Props> = ({ showToggle }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

        let target = document.querySelector('#prism-theme');
        if (!target) {
            const link = document.createElement('link');
            link.id = 'prism-theme';
            link.setAttribute('rel', 'stylesheet');
            document.head.appendChild(link);
            target = link;
        }

        target.setAttribute(
            'href',
            isDarkMode
                ? 'https://cdn.jsdelivr.net/npm/prism-themes@1.7.0/themes/prism-nord.css'
                : 'https://cdn.jsdelivr.net/npm/prism-themes@1.7.0/themes/prism-material-light.css',
        );
    }, [isDarkMode]);

    return (
        <header className="doc-header">
            <div className="doc-header_left">
                {showToggle && <span className="icon material-icons-outlined">menu</span>}
                <a href="/milkdown/" className="doc-header_icon">
                    <img className="logo" src="/milkdown/milkdown-mini.svg" />
                    <span className="title">Milkdown</span>
                </a>
            </div>
            <div className="doc-header_right">
                <span onClick={() => setIsDarkMode(!isDarkMode)} className="icon material-icons-outlined">
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
                <a href="https://github.com/Saul-Mirone/milkdown" className="doc-header_github">
                    <span className="icon material-icons-outlined">open_in_new</span>
                    <span>Open in Github</span>
                </a>
            </div>
        </header>
    );
};

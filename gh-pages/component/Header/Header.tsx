import React from 'react';
import { useIsIndex } from '../useIsIndex';

import className from './style.module.css';

type Props = {
    onToggle: () => void;
};

const materialIcon = `${className.icon} material-icons-outlined`;

export const Header: React.FC<Props> = ({ onToggle }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [showToggle, setShowToggle] = React.useState(true);
    const isIndex = useIsIndex();

    React.useEffect(() => {
        if (isIndex) {
            setShowToggle(false);
            return;
        }
        setShowToggle(true);
    }, [location]);

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
        <header className={className.header}>
            <div className={className.part}>
                {showToggle && (
                    <span className={materialIcon} onClick={() => onToggle?.()}>
                        menu
                    </span>
                )}
                <a href="/milkdown/" className={className.logo}>
                    <img src="/milkdown/milkdown-mini.svg" />
                    <span>Milkdown</span>
                </a>
            </div>
            <div className={className.part}>
                <span onClick={() => setIsDarkMode(!isDarkMode)} className={materialIcon}>
                    {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
                <a href="https://github.com/Saul-Mirone/milkdown" className={className.github}>
                    <span className={materialIcon}>open_in_new</span>
                    <span>Open in Github</span>
                </a>
            </div>
        </header>
    );
};

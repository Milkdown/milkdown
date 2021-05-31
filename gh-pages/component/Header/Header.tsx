import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { LocationType, useLocationType } from '../hooks/useLocationType';
import className from './style.module.css';

type Props = {
    onToggle: () => void;
};

const materialIcon = `${className.icon} material-icons-outlined`;

const darkMode = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);

export const Header: React.FC<Props> = ({ onToggle }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(darkMode);
    const [showToggle, setShowToggle] = React.useState(true);
    const locationType = useLocationType();

    React.useEffect(() => {
        if (locationType !== LocationType.Page) {
            setShowToggle(false);
            return;
        }
        setShowToggle(true);
    }, [locationType]);

    useDarkMode(isDarkMode);

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
                <a href="https://github.com/Saul-Mirone/milkdown" target="_blank" className={className.github}>
                    <span className={materialIcon}>open_in_new</span>
                </a>
            </div>
        </header>
    );
};

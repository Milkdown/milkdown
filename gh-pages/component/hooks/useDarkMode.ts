/* Copyright 2021, Milkdown by Mirone. */
import { useEffect } from 'react';

const code = {
    // light: 'https://unpkg.com/prism-themes/themes/prism-material-light.css',
    light: 'https://unpkg.com/prism-themes/themes/prism-nord.css',
    dark: 'https://unpkg.com/prism-themes/themes/prism-nord.css',
};

const getStyleLink = () => {
    const target = document.querySelector('#prism-theme');

    if (target) {
        return target;
    }

    const link = document.createElement('link');
    link.id = 'prism-theme';
    link.setAttribute('rel', 'stylesheet');
    document.head.appendChild(link);
    return link;
};

export const useDarkMode = (isDarkMode: boolean, setIsDarkMode: (isDarkMode: boolean) => void): void => {
    useEffect(() => {
        const darkMode = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(darkMode);
    }, [setIsDarkMode]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

        const target = getStyleLink();

        target.setAttribute('href', isDarkMode ? code.dark : code.light);
    }, [isDarkMode]);
};

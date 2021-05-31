import { useEffect } from 'react';

const code = {
    light: 'https://unpkg.com/prism-themes/themes/prism-material-light.css',
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

export const useDarkMode = (isDarkMode: boolean): void => {
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

        const target = getStyleLink();

        target.setAttribute('href', isDarkMode ? code.dark : code.light);
    }, [isDarkMode]);
};

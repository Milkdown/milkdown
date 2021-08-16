import type { ThemePack } from '@milkdown/core';

const font = [
    'Roboto',
    'HelveticaNeue-Light',
    'Helvetica Neue Light',
    'Helvetica Neue',
    'Helvetica',
    'Arial',
    'Lucida Grande',
    'sans-serif',
];

const fontCode = ['Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', 'monospace'];

export const Nord = {
    nord0: '#2e3440',
    nord1: '#3b4252',
    nord2: '#434c5e',
    nord3: '#4c566a',
    nord4: '#d8dee9',
    nord5: '#e5e9f0',
    nord6: '#eceff4',
    nord7: '#8fbcbb',
    nord8: '#88c0d0',
    nord9: '#81a1c1',
    nord10: '#5e81ac',
    nord11: '#bf616a',
    nord12: '#d08770',
    nord13: '#ebcb8b',
    nord14: '#a3be8c',
    nord15: '#b48ead',
};

export const nord: ThemePack = {
    font: {
        font,
        fontCode,
    },
    color: {
        shadow: Nord.nord1,
        primary: Nord.nord10,
        secondary: Nord.nord9,
        light: {
            neutral: Nord.nord0,
            solid: Nord.nord3,
            line: Nord.nord4,
            background: Nord.nord6,
            surface: '#fff',
        },
        dark: {
            neutral: Nord.nord6,
            solid: Nord.nord4,
            line: Nord.nord2,
            background: '#252932',
            surface: Nord.nord0,
        },
    },
};

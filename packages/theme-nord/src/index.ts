import { css } from '@emotion/css';
import { themeFactory } from '@milkdown/core';

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

export const nord = themeFactory({
    font: {
        font,
        fontCode,
    },
    size: {
        radius: '4px',
        lineWidth: '1px',
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
    widget: ({ palette }) => ({
        icon: (key: string) => css`
            content: ${key};

            font-family: Material Icons Outlined;
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            display: inline-block;
            direction: ltr;

            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: liga;
        `,
        scrollbar: (direction = 'y') => css`
            scrollbar-width: thin;
            scrollbar-color: ${palette('secondary', 0.38)} ${palette('secondary', 0.12)};
            -webkit-overflow-scrolling: touch;
            &::-webkit-scrollbar: {
                ${[direction === 'x' ? 'width' : 'height']}: 4px;
                padding: 0 2px;
                background: ${palette('surface')};
            }
            &::-webkit-scrollbar-track': {
                border-radius: 4px;
                background: ${palette('secondary', 0.12)};
            }
            &::-webkit-scrollbar-thumb': {
                border-radius: 4px;
                background: ${palette('secondary', 0.38)};
            }
            &::-webkit-scrollbar-thumb:hover': {
                background: ${palette('secondary')},
            }
        `,
    }),
});

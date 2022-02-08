/* Copyright 2021, Milkdown by Mirone. */
import {
    hex2rgb,
    ThemeBorder,
    ThemeColor,
    themeFactory,
    ThemeFont,
    ThemeGlobal,
    ThemeIcon,
    ThemeScrollbar,
    ThemeShadow,
    ThemeSize,
} from '@milkdown/core';
import { useAllPresetRenderer } from '@milkdown/theme-pack-helper';

import { code, typography } from './font';
import { getIcon } from './icon';
import { darkColor, lightColor } from './nord';
import { getStyle } from './style';
import { view } from './view';

export const font = {
    typography,
    code,
};

export const size = {
    radius: '4px',
    lineWidth: '1px',
};

export const getNord = (isDarkMode = false) =>
    themeFactory((emotion, manager) => {
        const { css } = emotion;
        const colorSet = isDarkMode ? darkColor : lightColor;

        manager.set(ThemeColor, (options) => {
            if (!options) return;
            const [key, opacity] = options;
            const hex = colorSet[key];
            const rgb = hex2rgb(hex);
            if (!rgb) return;

            return `rgba(${rgb?.join(', ')}, ${opacity || 1})`;
        });

        manager.set(ThemeSize, (key) => {
            if (!key) return;
            return size[key];
        });

        manager.set(ThemeFont, (key) => {
            if (!key) return;
            return font[key].join(', ');
        });

        manager.set(ThemeScrollbar, (direction = 'y') => {
            const main = manager.get(ThemeColor, ['secondary', 0.38]);
            const bg = manager.get(ThemeColor, ['secondary', 0.12]);
            const hover = manager.get(ThemeColor, ['secondary']);
            return css`
                scrollbar-width: thin;
                scrollbar-color: ${main} ${bg};
                -webkit-overflow-scrolling: touch;

                &::-webkit-scrollbar {
                    ${direction === 'y' ? 'width' : 'height'}: 12px;
                    background-color: transparent;
                }

                &::-webkit-scrollbar-track {
                    border-radius: 999px;
                    background: transparent;
                    border: 4px solid transparent;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 999px;
                    background-color: ${main};
                    border: 4px solid transparent;
                    background-clip: content-box;
                }

                &::-webkit-scrollbar-thumb:hover {
                    background-color: ${hover};
                }
            `;
        });

        manager.set(ThemeShadow, () => {
            const { lineWidth } = size;
            const getShadow = (opacity: number) => manager.get(ThemeColor, ['shadow', opacity]);
            return css`
                box-shadow: 0px ${lineWidth} ${lineWidth} ${getShadow(0.14)}, 0px 2px ${lineWidth} ${getShadow(0.12)},
                    0px ${lineWidth} 3px ${getShadow(0.2)};
            `;
        });

        manager.set(ThemeBorder, (direction) => {
            const line = manager.get(ThemeColor, ['line']);
            if (!direction) {
                return css`
                    border: ${size.lineWidth} solid ${line};
                `;
            }
            return css`
                ${`border-${direction}`}: ${size.lineWidth} solid ${line};
            `;
        });

        manager.set(ThemeIcon, (icon) => {
            if (!icon) return;

            return getIcon(icon);
        });

        manager.set(ThemeGlobal, () => {
            const css = emotion.injectGlobal;

            css`
                ${view(emotion)};
            `;

            getStyle(manager, emotion);
        });

        useAllPresetRenderer(manager, emotion);
    });

export const nordDark = getNord(true);
export const nordLight = getNord(false);

const darkMode = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
export const nord = getNord(darkMode);

export { color, darkColor, lightColor } from './nord';
export { view } from './view';

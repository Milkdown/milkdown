/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { ThemePack } from '@milkdown/design-system';

export const mixin: ThemePack['mixin'] = ({ palette, size }) => ({
    scrollbar: (direction = 'y') => css`
        scrollbar-width: thin;
        scrollbar-color: ${palette('secondary', 0.38)} ${palette('secondary', 0.12)};
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
            ${direction === 'y' ? 'width' : 'height'}: 4px;
            padding: 0 2px;
            background: ${palette('surface')};
        }

        &::-webkit-scrollbar-track {
            border-radius: 4px;
            background: ${palette('secondary', 0.12)};
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 4px;
            background: ${palette('secondary', 0.38)};
        }

        &::-webkit-scrollbar-thumb:hover {
            background: ${palette('secondary')};
        }
    `,
    shadow: () => {
        const { lineWidth } = size;
        return css`
            box-shadow: 0px ${lineWidth} ${lineWidth} ${palette('shadow', 0.14)},
                0px 2px ${lineWidth} ${palette('shadow', 0.12)}, 0px ${lineWidth} 3px ${palette('shadow', 0.2)};
        `;
    },
    border: (direction) => {
        if (!direction) {
            return css`
                border: ${size.lineWidth} solid ${palette('line')};
            `;
        }
        return css`
            ${`border-${direction}`}: ${size.lineWidth} solid ${palette('line')};
        `;
    },
});

/* Copyright 2021, Milkdown by Mirone. */
import {
    Color,
    Emotion,
    ThemeBorder,
    ThemeColor,
    ThemeFont,
    ThemeIcon,
    ThemeManager,
    ThemeScrollbar,
    ThemeShadow,
    ThemeSize,
} from '@milkdown/core';
import type { ThemeCodeFenceType } from '@milkdown/preset-commonmark';
import type { Node } from '@milkdown/prose';

export const codeFence = (manager: ThemeManager, { css }: Emotion) => {
    const palette = (color: Color, opacity = 1) => manager.get(ThemeColor, [color, opacity]);
    const radius = manager.get(ThemeSize, 'radius');
    const lineWidth = manager.get(ThemeSize, 'lineWidth');

    const style = css`
        background-color: ${palette('background')};
        color: ${palette('neutral')};
        font-size: 0.85rem;
        padding: 1.2rem 0.4rem 1.4rem;
        border-radius: ${radius};
        font-family: ${manager.get(ThemeFont, 'typography')};

        .code-fence_selector-wrapper {
            position: relative;
        }

        .code-fence_selector {
            width: 10.25rem;
            box-sizing: border-box;
            border-radius: ${radius};
            margin: 0 1.2rem 1.2rem;
            cursor: pointer;
            background-color: ${palette('surface')};
            position: relative;
            display: flex;
            color: ${palette('neutral', 0.87)};
            letter-spacing: 0.5px;
            height: 2.625rem;
            align-items: center;

            ${manager.get(ThemeBorder, undefined)};
            ${manager.get(ThemeShadow)};

            & > .icon {
                width: 2.625rem;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                color: ${palette('solid', 0.87)};
                border-left: ${lineWidth} solid ${palette('line')};

                text-align: center;
                transition: all 0.2s ease-in-out;
                &:hover {
                    background: ${palette('background')};
                    color: ${palette('primary')};
                }
            }

            > span:first-child {
                padding-left: 1rem;
                flex: 1;
                font-weight: 500;
            }
        }

        .code-fence_selector-list-item {
            list-style: none;
            line-height: 2rem;
            padding-left: 1rem;
            cursor: pointer;
            margin: 0 !important;
            :hover {
                background: ${palette('secondary', 0.12)};
                color: ${palette('primary')};
            }
        }

        .code-fence_selector-list {
            &[data-fold='true'] {
                display: none;
            }

            margin: 0 !important;
            font-weight: 500;
            position: absolute;
            z-index: 1;
            top: 2.625rem;
            box-sizing: border-box;
            left: 1.2rem;
            padding: 0.5rem 0;
            max-height: 16.75rem;
            width: 10.25rem;
            background-color: ${palette('surface')};
            border-top: none;
            overflow-y: auto;
            display: flex;
            flex-direction: column;

            ${manager.get(ThemeScrollbar, 'y')}
            ${manager.get(ThemeBorder, undefined)};
            ${manager.get(ThemeShadow)};
        }
    `;

    manager.setCustom<ThemeCodeFenceType>(
        'code-fence',
        ({ editable, onSelectLanguage, onBlur, onFocus, languageList }) => {
            const container = document.createElement('div');
            const selectWrapper = document.createElement('div');
            const select = document.createElement('ul');
            const pre = document.createElement('pre');
            const code = document.createElement('code');

            const valueWrapper = document.createElement('div');
            valueWrapper.className = 'code-fence_selector';

            const value = document.createElement('span');
            valueWrapper.appendChild(value);

            const downIcon = manager.get(ThemeIcon, 'downArrow');
            if (editable() && downIcon) {
                valueWrapper.appendChild(downIcon.dom);
            }
            code.spellcheck = false;
            selectWrapper.className = 'code-fence_selector-wrapper';
            selectWrapper.contentEditable = 'false';
            selectWrapper.append(valueWrapper);
            selectWrapper.append(select);
            pre.append(code);
            const codeContent = document.createElement('div');
            code.append(codeContent);
            codeContent.style.whiteSpace = 'inherit';
            container.append(selectWrapper, pre);

            // container.setAttribute('class', utils.getClassName(node.attrs, 'code-fence', style));
            container.classList.add('code-fence');
            if (style) {
                container.classList.add(style);
            }

            select.className = 'code-fence_selector-list';
            select.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!editable()) return;

                const el = e.target;
                if (!(el instanceof HTMLLIElement)) return;
                const value = el.dataset['value'];
                if (value != null) {
                    onSelectLanguage(value);
                }
            });
            valueWrapper.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!editable()) return;
                onFocus();
            });

            document.addEventListener('mousedown', () => {
                if (!editable() || select.dataset['fold'] === 'true') return;

                onBlur();
            });

            languageList.forEach((lang) => {
                const option = document.createElement('li');
                option.className = 'code-fence_selector-list-item';
                option.innerText = lang || '--';
                select.appendChild(option);
                option.setAttribute('data-value', lang);
            });

            const onUpdate = (node: Node) => {
                container.dataset['language'] = node.attrs['language'];
                value.innerText = node.attrs['language'] || '--';
                select.setAttribute('data-fold', node.attrs['fold'] ? 'true' : 'false');
            };

            return {
                dom: container,
                contentDOM: codeContent,
                onUpdate,
            };
        },
    );
};

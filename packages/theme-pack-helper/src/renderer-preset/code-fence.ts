/* Copyright 2021, Milkdown by Mirone. */
import type { Emotion, ThemeCodeFenceType, ThemeManager } from '@milkdown/core';
import { getPalette, ThemeBorder, ThemeFont, ThemeIcon, ThemeScrollbar, ThemeShadow, ThemeSize } from '@milkdown/core';
import type { Node } from '@milkdown/prose/model';

const getStyle = (manager: ThemeManager, { css }: Emotion) => {
    const palette = getPalette(manager);
    const radius = manager.get(ThemeSize, 'radius');
    const lineWidth = manager.get(ThemeSize, 'lineWidth');

    return css`
        background-color: ${palette('background')};
        color: ${palette('neutral')};
        font-size: 0.875em;
        padding: 1.2em 0.4em 1.4em;
        border-radius: ${radius};
        font-family: ${manager.get(ThemeFont, 'typography')};

        .code-fence_selector-wrapper {
            position: relative;
        }

        .code-fence_selector {
            width: 11.71em;
            box-sizing: border-box;
            border-radius: ${radius};
            margin: 0 1.2em 1.2em;
            cursor: pointer;
            background-color: ${palette('surface')};
            position: relative;
            display: flex;
            color: ${palette('neutral', 0.87)};
            letter-spacing: 0.5px;
            height: 3em;
            align-items: center;

            ${manager.get(ThemeBorder, undefined)};
            ${manager.get(ThemeShadow, undefined)};

            & > .icon {
                width: 2em;
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
                padding-left: 1em;
                flex: 1;
                font-weight: 500;
            }
        }

        .code-fence_selector-list-item {
            list-style: none;
            line-height: 2;
            padding-left: 1em;
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
            top: 3em;
            box-sizing: border-box;
            left: 1.2em;
            padding: 0.5em 0;
            max-height: 16.75em;
            width: 11.71em;
            background-color: ${palette('surface')};
            border-top: none;
            overflow-y: auto;
            display: flex;
            flex-direction: column;

            ${manager.get(ThemeScrollbar, ['y'])}
            ${manager.get(ThemeBorder, undefined)};
            ${manager.get(ThemeShadow, undefined)};
        }
    `;
};

export const codeFence = (manager: ThemeManager, emotion: Emotion) => {
    manager.set<ThemeCodeFenceType>('code-fence', ({ editable, onSelectLanguage, onBlur, onFocus, languageList }) => {
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

        container.classList.add('code-fence');

        manager.onFlush(() => {
            const style = getStyle(manager, emotion);
            if (style) {
                container.classList.add(style);
            }
        });

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

        const onClickOutside = () => {
            if (!editable() || select.dataset['fold'] === 'true') return;

            onBlur();
        };
        document.addEventListener('mousedown', onClickOutside);

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

        const onDestroy = () => {
            container.remove();
            document.removeEventListener('mousedown', onClickOutside);
        };

        return {
            dom: container,
            contentDOM: codeContent,
            onUpdate,
            onDestroy,
        };
    });
};

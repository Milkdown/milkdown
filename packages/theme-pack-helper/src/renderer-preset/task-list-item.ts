/* Copyright 2021, Milkdown by Mirone. */

import { Emotion, getPalette, Icon, ThemeIcon, ThemeManager, ThemeSize } from '@milkdown/core';
import { ThemeTaskListItemType } from '@milkdown/preset-gfm';

export const taskListItem = (manager: ThemeManager, { css }: Emotion) => {
    const palette = getPalette(manager);

    const style = css`
        list-style-type: none;
        position: relative;

        & > div {
            overflow: hidden;
            padding: 0 2px;
        }

        label {
            position: absolute;
            top: 0;
            left: -2rem;
            display: inline-block;
            width: 1.5rem;
            height: 1.5rem;
            margin: 0.5rem 0;
            cursor: pointer;
            input {
                visibility: hidden;
            }
        }
        label:before {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            border-radius: ${manager.get(ThemeSize, 'radius')};
        }
        label:hover:before {
            background: ${palette('background')};
        }
        &[data-checked='true'] {
            label {
                color: ${palette('primary')};
            }
        }
        &[data-checked='false'] {
            label {
                color: ${palette('solid', 0.87)};
            }
        }
        .paragraph {
            margin: 0.5rem 0;
        }
    `;

    manager.setCustom<ThemeTaskListItemType>('task-list-item', ({ onChange, editable }) => {
        const createIcon = (icon: Icon) => manager.get(ThemeIcon, icon)?.dom as HTMLElement;

        const listItem = document.createElement('li');
        const checkboxWrapper = document.createElement('label');
        const checkboxStyler = document.createElement('span');
        const checkbox = document.createElement('input');
        const content = document.createElement('div');

        let icon = createIcon('unchecked');
        checkboxWrapper.appendChild(icon);
        const setIcon = (name: Icon) => {
            const nextIcon = createIcon(name);
            checkboxWrapper.replaceChild(nextIcon, icon);
            icon = nextIcon;
        };

        checkboxWrapper.append(checkbox, checkboxStyler);
        listItem.append(checkboxWrapper, content);

        checkboxWrapper.contentEditable = 'false';
        checkbox.type = 'checkbox';
        checkbox.onchange = (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement)) return;

            if (!editable) {
                checkbox.checked = !checkbox.checked;

                return;
            }

            event.preventDefault();

            onChange(checkbox.checked);
        };
        listItem.dataset['type'] = 'task-item';
        listItem.classList.add('task-list-item');
        if (style) {
            listItem.classList.add(style);
        }

        return {
            dom: listItem,
            contentDOM: content,
            onUpdate: (node) => {
                listItem.dataset['checked'] = node.attrs['checked'];
                if (node.attrs['checked']) {
                    checkbox.setAttribute('checked', 'checked');
                } else {
                    checkbox.removeAttribute('checked');
                }
                setIcon(node.attrs['checked'] ? 'checked' : 'unchecked');
            },
        };
    });
};

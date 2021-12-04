/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

export const menubar = (utils: Utils, view: EditorView) => {
    const editorWrapperStyle = utils.getStyle((themeTool) => {
        return css`
            ${themeTool.mixin.scrollbar('y')};
        `;
    });
    const menuStyle = utils.getStyle((themeTool) => {
        return css`
            box-sizing: border-box;
            width: 100%;
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            ${themeTool.mixin.border()};
            ${themeTool.mixin.scrollbar('x')};

            .disabled {
                display: none;
            }
        `;
    });

    const menuWrapper = document.createElement('div');
    const menu = document.createElement('div');
    menuWrapper.appendChild(menu);
    menuWrapper.classList.add('milkdown-menu-wrapper');
    if (menuStyle) {
        menu.classList.add(menuStyle);
    }

    const editorDom = view.dom;
    if (editorWrapperStyle) {
        editorDom.classList.add(editorWrapperStyle);
    }

    const parent = editorDom.parentNode;
    if (!parent) {
        throw new Error('No parent node found');
    }
    parent.replaceChild(menuWrapper, editorDom);
    menuWrapper.appendChild(editorDom);

    return menu;
};

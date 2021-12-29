/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

export const menubar = (utils: Utils, view: EditorView) => {
    const editorWrapperStyle = utils.getStyle((themeTool) => {
        return themeTool.mixin.scrollbar('y');
    });
    const menuStyle = utils.getStyle((themeTool) => {
        const border = themeTool.mixin.border();
        const scrollbar = themeTool.mixin.scrollbar('x');
        const style = css`
            box-sizing: border-box;
            width: 100%;
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            ${border};
            ${scrollbar};
            background: ${themeTool.palette('surface')};

            -webkit-overflow-scrolling: auto;

            .disabled {
                display: none;
            }
        `;
        return style;
    });

    const menuWrapper = document.createElement('div');
    const menu = document.createElement('div');
    menu.classList.add('milkdown-menu');
    menuWrapper.appendChild(menu);
    menuWrapper.classList.add('milkdown-menu-wrapper');
    if (menuStyle) {
        menuStyle.split(' ').forEach((x) => menu.classList.add(x));
    }

    const editorDom = view.dom;
    if (editorWrapperStyle) {
        editorDom.classList.add(editorWrapperStyle);
    }

    const milkdown = editorDom.parentElement;
    if (!milkdown) {
        throw new Error('No parent node found');
    }
    const root = milkdown.parentElement;
    if (!root) {
        throw new Error('No root node found');
    }
    root.replaceChild(menuWrapper, milkdown);
    // milkdown.appendChild(milkdown);
    // milkdown.replaceChild(menuWrapper, editorDom);
    menuWrapper.appendChild(milkdown);

    return menu;
};

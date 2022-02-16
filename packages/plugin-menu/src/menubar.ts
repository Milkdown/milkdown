/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, rootCtx, ThemeBorder, ThemeColor, ThemeScrollbar } from '@milkdown/core';
import { EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

export type HandleDOMParams = {
    menu: HTMLDivElement;
    menuWrapper: HTMLDivElement;
    editorRoot: HTMLElement;
    editorDOM: HTMLDivElement;
};

export type HandleDOM = (params: HandleDOMParams) => void;

const defaultDOMHandler: HandleDOM = ({ menu, menuWrapper, editorDOM, editorRoot }) => {
    menuWrapper.appendChild(menu);

    const milkdown = editorDOM.parentElement;
    if (!milkdown) {
        throw new Error('No parent node found');
    }
    editorRoot.replaceChild(menuWrapper, milkdown);
    menuWrapper.appendChild(milkdown);
};

const getRoot = (root: string | Node | null | undefined) => {
    if (!root) return document.body;

    if (typeof root === 'string') {
        const el = document.querySelector(root);
        if (el) return el;

        return document.body;
    }

    return root;
};

export const menubar = (utils: Utils, view: EditorView, ctx: Ctx, domHandler: HandleDOM = defaultDOMHandler) => {
    const editorWrapperStyle = utils.getStyle((themeManager) => {
        return themeManager.get(ThemeScrollbar, 'y') as string;
    });
    const menuStyle = utils.getStyle((themeManager, { css }) => {
        const border = themeManager.get(ThemeBorder, undefined);
        const scrollbar = themeManager.get(ThemeScrollbar, 'x');
        const style = css`
            box-sizing: border-box;
            width: 100%;
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            ${border};
            ${scrollbar};
            overflow-y: hidden;
            background: ${themeManager.get(ThemeColor, ['surface'])};

            -webkit-overflow-scrolling: auto;

            .disabled {
                display: none;
            }
        `;
        return style;
    });

    const menuWrapper = document.createElement('div');
    menuWrapper.classList.add('milkdown-menu-wrapper');
    const menu = document.createElement('div');
    menu.classList.add('milkdown-menu');
    if (menuStyle) {
        menuStyle.split(' ').forEach((x) => menu.classList.add(x));
    }

    const editorDOM = view.dom as HTMLDivElement;
    if (editorWrapperStyle) {
        editorDOM.classList.add(editorWrapperStyle);
    }

    const root = ctx.get(rootCtx);

    const editorRoot = getRoot(root) as HTMLElement;

    domHandler({
        menu,
        menuWrapper,
        editorDOM,
        editorRoot,
    });

    return menu;
};

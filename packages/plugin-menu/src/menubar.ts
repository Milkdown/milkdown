/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, rootCtx, ThemeBorder, ThemeColor, ThemeFont, ThemeScrollbar } from '@milkdown/core';
import { missingRootElement } from '@milkdown/exception';
import { EditorView } from '@milkdown/prose/view';
import { Utils } from '@milkdown/utils';

export type HandleDOMParams = {
    menu: HTMLDivElement;
    menuWrapper: HTMLDivElement;
    editorRoot: HTMLElement;
    milkdownDOM: HTMLElement;
    editorDOM: HTMLDivElement;
};

export type HandleDOM = (params: HandleDOMParams) => void;

const restore: HandleDOM = ({ menu }) => {
    menu.remove();
};

const defaultDOMHandler: HandleDOM = ({ menu, menuWrapper, milkdownDOM }) => {
    menuWrapper.insertBefore(menu, milkdownDOM);
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

let _menuWrapper: HTMLDivElement | null = null;
export const initWrapper = (ctx: Ctx, view: EditorView) => {
    if (_menuWrapper !== null) {
        throw new Error('Repeated calls to menu wrapper initialization');
    }
    _menuWrapper = document.createElement('div');
    _menuWrapper.classList.add('milkdown-menu-wrapper');

    const root = ctx.get(rootCtx);

    const editorDOM = view.dom;
    const editorRoot = getRoot(root) as HTMLElement;
    const milkdownDOM = editorDOM.parentElement;

    if (!milkdownDOM) {
        throw missingRootElement();
    }

    editorRoot.replaceChild(_menuWrapper, milkdownDOM);
    _menuWrapper.appendChild(milkdownDOM);
};

const destory: HandleDOM = ({ menu, menuWrapper, editorRoot, milkdownDOM }) => {
    editorRoot.appendChild(milkdownDOM);
    menuWrapper.remove();
    menu.remove();
    _menuWrapper = null;
};

const missingMenuWrapper = () => new Error('Missing menu wrapper, should init menu wrapper first.');

export const menubar = (utils: Utils, view: EditorView, ctx: Ctx, domHandler: HandleDOM = defaultDOMHandler) => {
    if (!_menuWrapper) {
        throw missingMenuWrapper();
    }

    const menu = document.createElement('div');
    menu.classList.add('milkdown-menu');

    const editorDOM = view.dom as HTMLDivElement;
    const { themeManager } = utils;

    themeManager.onFlush(() => {
        const editorWrapperStyle = utils.getStyle(() => {
            return themeManager.get(ThemeScrollbar, ['y']) as string;
        });
        if (editorWrapperStyle) {
            editorDOM.classList.add(editorWrapperStyle);
        }
        const menuStyle = utils.getStyle(({ css }) => {
            const border = themeManager.get(ThemeBorder, undefined);
            const scrollbar = themeManager.get(ThemeScrollbar, ['x', 'thin']);
            const style = css`
                font-family: ${themeManager.get(ThemeFont, 'typography')};
                box-sizing: border-box;
                width: 100%;
                display: flex;
                flex-wrap: nowrap;
                overflow-x: scroll;
                ${border};
                ${scrollbar};
                overflow-y: hidden;
                background: ${themeManager.get(ThemeColor, ['surface'])};
                transition: background-color 0.4s ease-in-out;

                -webkit-overflow-scrolling: auto;

                .disabled {
                    display: none;
                }
            `;
            return style;
        });
        if (menuStyle) {
            menuStyle.split(' ').forEach((x) => menu.classList.add(x));
        }
    });

    const root = ctx.get(rootCtx);

    const editorRoot = getRoot(root) as HTMLElement;
    const milkdownDOM = editorDOM.parentElement;

    if (!milkdownDOM) {
        throw missingRootElement();
    }

    domHandler({
        menu,
        menuWrapper: _menuWrapper,
        editorDOM,
        editorRoot,
        milkdownDOM,
    });

    const restoreDOM = () => {
        if (!_menuWrapper) {
            throw missingMenuWrapper();
        }
        restore({
            menu,
            menuWrapper: _menuWrapper,
            editorDOM,
            editorRoot,
            milkdownDOM,
        });
    };
    const destoryDOM = () => {
        if (!_menuWrapper) {
            throw missingMenuWrapper();
        }
        destory({
            menu,
            menuWrapper: _menuWrapper,
            editorDOM,
            editorRoot,
            milkdownDOM,
        });
    };

    return [menu, restoreDOM, destoryDOM] as const;
};

import { commandsCtx, Ctx } from '@milkdown/core';
import { ModifyImage, ModifyLink } from '@milkdown/preset-commonmark';
import { findChildNode, findMarkByType } from '@milkdown/utils';
import { Event2Command, Updater } from '../item';
import { elementIsTag } from './element';

export const modifyLink =
    (ctx: Ctx): Event2Command =>
    (e) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return () => true;
        }
        if (elementIsTag(target, 'input')) {
            target.focus();
            return () => false;
        }
        const parent = target.parentNode;
        if (!parent) return () => false;

        const inputEl = Array.from(parent.children).find((el) => el.tagName === 'INPUT');
        if (!(inputEl instanceof HTMLInputElement)) return () => false;

        return ctx.get(commandsCtx).get(ModifyLink)(inputEl.value);
    };

export const modifyImage =
    (ctx: Ctx): Event2Command =>
    (e) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return () => true;
        }
        if (elementIsTag(target, 'input')) {
            target.focus();
            return () => false;
        }
        const parent = target.parentNode;
        if (!parent) return () => false;

        const inputEl = Array.from(parent.children).find((el) => el.tagName === 'INPUT');
        if (!(inputEl instanceof HTMLInputElement)) return () => false;

        return ctx.get(commandsCtx).get(ModifyImage)(inputEl.value);
    };

export const updateLinkView: Updater = (view, $) => {
    const { marks } = view.state.schema;
    const { firstChild, lastElementChild } = $;
    if (!(firstChild instanceof HTMLInputElement) || !(lastElementChild instanceof HTMLButtonElement)) return;

    const node = findMarkByType(view.state, marks.link);
    if (!node) return;

    const mark = node.marks.find((m) => m.type === marks.link);
    if (!mark) return;

    const value = mark.attrs.href;
    firstChild.value = value;
    if (!value) {
        lastElementChild.classList.add('disable');
        return;
    }
    if (lastElementChild.classList.contains('disable')) {
        lastElementChild.classList.remove('disable');
    }
};

export const updateImageView: Updater = (view, $) => {
    const { nodes } = view.state.schema;
    const { firstChild, lastElementChild } = $;
    if (!(firstChild instanceof HTMLInputElement) || !(lastElementChild instanceof HTMLButtonElement)) return;

    const node = findChildNode(view.state.selection, nodes.image);
    if (!node) return;

    const value = node.node.attrs.src;
    firstChild.value = value;
    if (!value) {
        lastElementChild.classList.add('disable');
        return;
    }
    if (lastElementChild.classList.contains('disable')) {
        lastElementChild.classList.remove('disable');
    }
};

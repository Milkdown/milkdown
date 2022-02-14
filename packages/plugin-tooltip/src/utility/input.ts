/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, Ctx } from '@milkdown/core';
import { findSelectedNodeOfType, Node as ProseNode } from '@milkdown/prose';

import { Event2Command, Updater } from '../item';
import { elementIsTag } from './element';

export const modifyLink =
    (ctx: Ctx): Event2Command =>
    (e: Event | KeyboardEvent) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return () => true;
        }
        if (elementIsTag(target, 'input')) {
            if (!('key' in e) || e.key !== 'Enter') {
                target.focus();
                return () => false;
            }
        }
        const parent = target.parentNode;
        if (!parent) return () => false;

        const inputEl = Array.from(parent.children).find((el) => el.tagName === 'INPUT');
        if (!(inputEl instanceof HTMLInputElement)) return () => false;

        return ctx.get(commandsCtx).callByName('ModifyLink', inputEl.value);
    };

export const modifyInlineMath =
    (ctx: Ctx): Event2Command =>
    (e) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return () => true;
        }
        const parent = target.parentNode;
        if (!parent) return () => false;

        const inputEl = Array.from(parent.children).find((el) => el.tagName === 'INPUT');
        if (!(inputEl instanceof HTMLInputElement)) return () => false;

        return ctx.get(commandsCtx).callByName('ModifyInlineMath', inputEl.value);
    };

export const modifyImage =
    (ctx: Ctx): Event2Command =>
    (e: Event | KeyboardEvent) => {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return () => true;
        }
        if (elementIsTag(target, 'input')) {
            if (!('key' in e) || e.key !== 'Enter') {
                target.focus();
                return () => false;
            }
        }
        const parent = target.parentNode;
        if (!parent) return () => false;

        const inputEl = Array.from(parent.children).find((el) => el.tagName === 'INPUT');
        if (!(inputEl instanceof HTMLInputElement)) return () => false;

        return ctx.get(commandsCtx).callByName('ModifyImage', inputEl.value);
    };

export const updateLinkView: Updater = (view, $) => {
    const { marks } = view.state.schema;
    const { firstChild, lastElementChild } = $;
    if (!(firstChild instanceof HTMLInputElement) || !(lastElementChild instanceof HTMLButtonElement)) return;

    const { selection } = view.state;
    let node: ProseNode | undefined;
    const { from, to } = selection;
    view.state.doc.nodesBetween(from, from === to ? to + 1 : to, (n) => {
        if (marks.link.isInSet(n.marks)) {
            node = n;
            return false;
        }
        return;
    });
    if (!node) return;

    const mark = node.marks.find((m) => m.type === marks.link);
    if (!mark) return;

    const value = mark.attrs['href'];
    firstChild.value = value;
    if (!value) {
        lastElementChild.classList.add('disable');
        return;
    }
    if (lastElementChild.classList.contains('disable')) {
        lastElementChild.classList.remove('disable');
    }
};

export const updateInlineMathView: Updater = (view, $) => {
    const { nodes } = view.state.schema;
    const { firstChild, lastElementChild } = $;
    if (!(firstChild instanceof HTMLInputElement) || !(lastElementChild instanceof HTMLButtonElement)) return;

    const result = findSelectedNodeOfType(view.state.selection, nodes.math_inline);
    if (!result) return;
    const { node } = result;

    const value = node.attrs['value'];
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

    const result = findSelectedNodeOfType(view.state.selection, nodes.image);
    if (!result) return;
    const { node } = result;

    const value = node.attrs['src'];
    firstChild.value = value.length > 100 ? 'Url is too long to display.' : value;
    if (!value) {
        lastElementChild.classList.add('disable');
        return;
    }
    if (lastElementChild.classList.contains('disable')) {
        lastElementChild.classList.remove('disable');
    }
};

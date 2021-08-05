import { Command } from 'prosemirror-commands';
import type { Mark, MarkType, Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { Event2Command, Updater } from '../item';
import { elementIsTag } from './element';
import { findMarkByType, findChildNode, findMarkPosition } from './prosemirror';

export const modifyLinkCommand =
    (mark: Mark, markType: MarkType, link: string): Command =>
    (state, dispatch) => {
        if (!dispatch) return false;

        const { start, end } = findMarkPosition(state, mark);
        const { tr } = state;
        const linkMark = markType.create({ ...mark.attrs, href: link });

        tr.removeMark(start, end).addMark(start, end, linkMark).setSelection(new TextSelection(tr.selection.$anchor));
        dispatch(tr.scrollIntoView());

        return true;
    };

export const modifyLink =
    (schema: Schema): Event2Command =>
    (e, view) => {
        const { target } = e;
        const { marks } = schema;
        const { link } = marks;
        if (!(target instanceof HTMLElement)) {
            return () => true;
        }
        if (elementIsTag(target, 'input')) {
            target.focus();
            return () => false;
        }

        const node = findMarkByType(view.state, link);
        if (!node) return () => false;

        const mark = node.marks.find(({ type }) => type === link);
        if (!mark) return () => false;

        const inputEl = target.parentNode?.firstChild;
        if (!(inputEl instanceof HTMLInputElement)) return () => false;

        return modifyLinkCommand(mark, marks.link, inputEl.value);
    };

export const modifyImage =
    (schema: Schema, attr: string): Event2Command =>
    (e, view) => {
        const { target } = e;
        const { nodes } = schema;
        const { image } = nodes;
        if (!(target instanceof HTMLElement)) {
            return () => true;
        }
        if (elementIsTag(target, 'input')) {
            target.focus();
            return () => false;
        }
        const node = findChildNode(view.state.selection, image);
        if (!node) return () => false;

        const parent = target.parentNode;
        if (!parent) return () => false;

        const inputEl = Array.from(parent.children).find((el) => el.tagName === 'INPUT');
        if (!(inputEl instanceof HTMLInputElement)) return () => false;

        return (state, dispatch) => {
            if (!dispatch) return false;

            const { tr } = state;
            tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, [attr]: inputEl.value });
            dispatch(tr.scrollIntoView());

            return true;
        };
    };

export const updateLink: (schema: Schema) => Updater = (schema) => (view, $) => {
    const { marks } = schema;
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

export const updateImage: (schema: Schema) => Updater = (schema) => (view, $) => {
    const { nodes } = schema;
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

/* Copyright 2021, Milkdown by Mirone. */

import { newlineInCode } from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { Node } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { StepMap } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

export const createInnerEditor = (outerView: EditorView, getPos: () => number) => {
    let isEditing = false;
    let innerView: EditorView | undefined;

    const openEditor = ($: HTMLElement, doc: Node) => {
        innerView = new EditorView($, {
            state: EditorState.create({
                doc,
                plugins: [
                    keymap({
                        Tab: (state, dispatch) => {
                            if (dispatch) {
                                dispatch(state.tr.insertText('\t'));
                            }
                            return true;
                        },
                        Enter: newlineInCode,
                        'Mod-Enter': (_, dispatch) => {
                            if (dispatch) {
                                const { state } = outerView;
                                const { to } = state.selection;
                                const tr = state.tr.replaceWith(to, to, state.schema.nodes.paragraph.createAndFill());
                                outerView.dispatch(tr.setSelection(TextSelection.create(tr.doc, to)));
                                outerView.focus();
                            }

                            return true;
                        },
                    }),
                ],
            }),
            dispatchTransaction: (tr) => {
                if (!innerView) return;
                const { state, transactions } = innerView.state.applyTransaction(tr);
                innerView.updateState(state);
                const outerTr = outerView.state.tr,
                    offsetMap = StepMap.offset(getPos() + 1);
                for (let i = 0; i < transactions.length; i++) {
                    const steps = transactions[i].steps;
                    for (let j = 0; j < steps.length; j++) {
                        const mapped = steps[j].map(offsetMap);
                        if (!mapped) {
                            throw Error('step discarded!');
                        }
                        outerTr.step(mapped);
                    }
                }
                if (outerTr.docChanged) outerView.dispatch(outerTr);
            },
        });
        innerView.focus();
        const { state } = innerView;
        innerView.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 0)));
        isEditing = true;
    };

    const closeEditor = () => {
        if (innerView) {
            innerView.destroy();
        }
        innerView = undefined;
        isEditing = false;
    };

    return {
        isEditing: () => isEditing,
        innerView: () => innerView,
        openEditor,
        closeEditor,
    };
};

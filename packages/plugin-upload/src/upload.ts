/* Copyright 2021, Milkdown by Mirone. */
import { schemaCtx, themeToolCtx } from '@milkdown/core';
import type { EditorView, Fragment, Node, Schema } from '@milkdown/prose';
import { Decoration, DecorationSet, EditorState, Plugin } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

import { defaultUploader } from './default-uploader';

export type Uploader = (files: FileList, schema: Schema) => Promise<Fragment | Node | Node[]>;
type Spec = { id: symbol; pos: number };

export const uploadPlugin = createPlugin<string, { uploader: Uploader; enableHtmlImagesUploader: boolean }>(
    (_, options) => {
        const uploader = options?.uploader ?? defaultUploader;

        return {
            prosePlugins: (_, ctx) => {
                const schema = ctx.get(schemaCtx);

                const placeholderPlugin = new Plugin({
                    state: {
                        init() {
                            return DecorationSet.empty;
                        },
                        apply(tr, set) {
                            const _set = set.map(tr.mapping, tr.doc);
                            const action = tr.getMeta(this);
                            if (!action) {
                                return _set;
                            }
                            if (action.add) {
                                const widget = document.createElement('span');
                                const { icon } = ctx.get(themeToolCtx).slots;
                                widget.appendChild(icon('loading'));
                                const decoration = Decoration.widget(action.add.pos, widget, { id: action.add.id });
                                return _set.add(tr.doc, [decoration]);
                            }
                            if (action.remove) {
                                return _set.remove(_set.find(null, null, (spec: Spec) => spec.id === action.remove.id));
                            }
                        },
                    },
                    props: {
                        decorations(state) {
                            return this.getState(state);
                        },
                    },
                });

                const findPlaceholder = (state: EditorState, id: symbol): number => {
                    const decorations = placeholderPlugin.getState(state);
                    const found = decorations.find(null, null, (spec: Spec) => spec.id === id);
                    return found.length ? found[0].from : -1;
                };

                const handleUpload = (
                    view: EditorView<Schema>,
                    event: DragEvent | ClipboardEvent,
                    files: FileList | undefined,
                ) => {
                    if (!files || files.length <= 0) {
                        return false;
                    }
                    const id = Symbol('upload symbol');
                    const { tr } = view.state;
                    const insertPos =
                        event instanceof DragEvent
                            ? view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? tr.selection.from
                            : tr.selection.from;
                    view.dispatch(tr.setMeta(placeholderPlugin, { add: { id, pos: insertPos } }));

                    uploader(files, schema)
                        .then((fragment) => {
                            const pos = findPlaceholder(view.state, id);
                            if (pos < 0) return;

                            view.dispatch(
                                view.state.tr
                                    .replaceWith(pos, pos, fragment)
                                    .setMeta(placeholderPlugin, { remove: { id } }),
                            );
                            return;
                        })
                        .catch((e) => {
                            console.error(e);
                        });
                    return true;
                };

                const uploadPlugin = new Plugin({
                    props: {
                        handlePaste: (view, event) => {
                            if (!(event instanceof ClipboardEvent)) {
                                return false;
                            }

                            if (!options?.enableHtmlImagesUploader && event.clipboardData?.getData('text/html')) {
                                return false;
                            }

                            return handleUpload(view, event, event.clipboardData?.files);
                        },
                        handleDrop: (view, event) => {
                            if (!(event instanceof DragEvent)) {
                                return false;
                            }

                            return handleUpload(view, event, event.dataTransfer?.files);
                        },
                    },
                });
                return [placeholderPlugin, uploadPlugin];
            },
        };
    },
);

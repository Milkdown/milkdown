/* Copyright 2021, Milkdown by Mirone. */
import { schemaCtx, ThemeIcon, themeManagerCtx } from '@milkdown/core';
import { missingIcon } from '@milkdown/exception';
import { Fragment, Node, Schema } from '@milkdown/prose/model';
import { EditorState, Plugin, PluginKey } from '@milkdown/prose/state';
import { Decoration, DecorationSet, EditorView } from '@milkdown/prose/view';
import { createPlugin } from '@milkdown/utils';

import { defaultUploader } from './default-uploader';

export type Uploader = (files: FileList, schema: Schema) => Promise<Fragment | Node | Node[]>;
type Spec = { id: symbol; pos: number };
export type Options = {
    uploader: Uploader;
    enableHtmlFileUploader: boolean;
};
export const key = new PluginKey('MILKDOWN_UPLOAD');

export const uploadPlugin = createPlugin<string, Options>((_, options) => {
    const uploader = options?.uploader ?? defaultUploader;

    return {
        prosePlugins: (_, ctx) => {
            const schema = ctx.get(schemaCtx);

            const placeholderPlugin = new Plugin({
                key,
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(this: Plugin, tr, set) {
                        const _set = set.map(tr.mapping, tr.doc);
                        const action = tr.getMeta(this);
                        if (!action) {
                            return _set;
                        }
                        if (action.add) {
                            const widget = document.createElement('span');
                            const loadingIcon = ctx.get(themeManagerCtx).get(ThemeIcon, 'loading');
                            if (!loadingIcon) {
                                throw missingIcon('loading');
                            }
                            widget.appendChild(loadingIcon.dom);
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const decoration = Decoration.widget(action.add.pos, widget, { id: action.add.id } as any);
                            return _set.add(tr.doc, [decoration]);
                        }
                        if (action.remove) {
                            return _set.remove(
                                _set.find(undefined, undefined, (spec: Spec) => spec.id === action.remove.id),
                            );
                        }

                        return _set;
                    },
                },
                props: {
                    decorations(this: Plugin, state) {
                        return this.getState(state);
                    },
                },
            });

            const findPlaceholder = (state: EditorState, id: symbol): number => {
                const decorations = placeholderPlugin.getState(state);
                if (!decorations) return -1;
                const found = decorations.find(undefined, undefined, (spec: Spec) => spec.id === id);
                if (!found.length) return -1;
                return found[0]?.from ?? -1;
            };

            const handleUpload = (view: EditorView, event: DragEvent | ClipboardEvent, files: FileList | undefined) => {
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

                        if (!options?.enableHtmlFileUploader && event.clipboardData?.getData('text/html')) {
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
});

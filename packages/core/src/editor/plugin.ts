import type { Node, Mark } from '../abstract';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import MarkdownIt, { PluginWithOptions } from 'markdown-it';
import { Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export interface ProsemirrorConfig {
    plugins: ProsemirrorPlugin[];
}

type MarkdownItPlugin =
    | MarkdownIt.PluginSimple
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | [MarkdownIt.PluginWithOptions, any]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | [MarkdownIt.PluginWithParams, ...any[]];

export interface MarkdownItConfig {
    enable: string[];
    plugins: MarkdownItPlugin[];
}

type Id<T> = (preset: T) => T;

export interface PluginConfig {
    getNodes: Id<typeof Node[]>;
    getMarks: Id<typeof Mark[]>;

    markdownIt: Partial<MarkdownItConfig>;
    prosemirror: (schema: Schema, view: EditorView) => ProsemirrorConfig;
}

export type Plugin = Partial<PluginConfig>;
export function createPlugin(config: Plugin) {
    return config;
}

export class PluginLoader {
    constructor(private plugins: Plugin[]) {}

    loadNodes(original: Id<typeof Node[]>, nodes: typeof Node[]) {
        const getNodesArray = this.plugins.filter((plugin) => plugin.getNodes).map((x) => x.getNodes) as Array<
            Id<typeof Node[]>
        >;
        return [original, ...getNodesArray].reduce((acc, fn) => fn(acc), nodes);
    }

    loadMarks(original: Id<typeof Mark[]>, marks: typeof Mark[]) {
        const getMarksArray = this.plugins.filter((plugin) => plugin.getMarks).map((x) => x.getMarks) as Array<
            Id<typeof Mark[]>
        >;
        return [original, ...getMarksArray].reduce((acc, fn) => fn(acc), marks);
    }

    loadMarkdownPlugin(markdownIt: MarkdownIt) {
        const plugins = this.plugins
            .filter((plugin) => plugin.markdownIt)
            .map((plugin) => plugin.markdownIt) as MarkdownItConfig[];
        plugins
            .filter((plugin) => plugin.enable)
            .forEach((plugin) => {
                markdownIt.enable(plugin.enable);
            });
        plugins
            .filter((plugin) => plugin.plugins)
            .forEach((plugin) => {
                plugin.plugins.forEach((markdownItPlugin) => {
                    if (Array.isArray(markdownItPlugin)) {
                        if (markdownItPlugin.length > 0) {
                            markdownIt.use(...(markdownItPlugin as [PluginWithOptions]));
                        }
                        return;
                    }
                    markdownIt.use(markdownItPlugin);
                });
            });
    }

    loadProsemirrorPlugin(schema: Schema, view: EditorView) {
        const plugins = this.plugins
            .filter((plugin) => plugin.prosemirror)
            .map((plugin) => plugin.prosemirror) as Array<PluginConfig['prosemirror']>;

        return plugins.map((plugin) => plugin(schema, view)).flatMap((x) => x.plugins);
    }
}

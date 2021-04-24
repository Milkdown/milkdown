import { Plugin } from 'prosemirror-state';
import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { PluginReadyContext } from '../editor';

const prosemirrorPluginLoader = (id: string) => {
    return class ProsemirrorPluginLoader extends Atom<
        PluginReadyContext,
        PluginReadyContext,
        { plugins: (ctx: PluginReadyContext) => Plugin[] }
    > {
        id = id;
        type = AtomType.ProsemirrorPlugin;
        loadAfter = LoadState.SchemaReady;
        main() {
            this.updateContext({
                prosemirrorPlugins: this.context.prosemirrorPlugins.concat(...this.options.plugins(this.context)),
            });
        }
    };
};

export const createProsemirrorPlugin = (id: string, plugins: (ctx: PluginReadyContext) => Plugin[]) => {
    const Factory = prosemirrorPluginLoader(id);
    return new Factory({ plugins });
};

import { Plugin } from 'prosemirror-state';
import { Atom } from '../abstract';
import { LoadState } from '../constant';
import { LoadPluginContext } from '../context';

const prosemirrorPluginLoader = (id: string) => {
    return class ProsemirrorPluginLoader extends Atom<
        LoadState.LoadPlugin,
        { plugins: (ctx: LoadPluginContext) => Plugin[] }
    > {
        override readonly id = id;
        override readonly loadAfter = LoadState.LoadPlugin;
        override main() {
            this.updateContext({
                prosemirrorPlugins: this.context.prosemirrorPlugins.concat(...this.options.plugins(this.context)),
            });
        }
    };
};

export const createProsemirrorPlugin = (id: string, plugins: (ctx: LoadPluginContext) => Plugin[]): Atom => {
    const Factory = prosemirrorPluginLoader(id);
    return new Factory({ plugins }) as Atom;
};

import { Plugin } from 'prosemirror-state';
import { Atom } from '../abstract';
import { AtomType, LoadState } from '../constant';
import { PluginReadyContext } from './context';

export class ProsemirrorPluginLoader extends Atom<PluginReadyContext, PluginReadyContext, { plugins: Plugin[] }> {
    id = 'prosemirrorPluginLoader';
    type = AtomType.Internal;
    loadAfter = LoadState.SchemaReady;
    main() {
        this.updateContext({
            prosemirrorPlugins: this.context.prosemirrorPlugins.concat(...this.options.plugins),
        });
    }
}

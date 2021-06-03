import { IdleContext, LoadPluginContext, CompleteContext, SchemaReadyContext } from '../editor';
import { LoadState } from '../constant';
import { AnyRecord } from '../utility';

type GetCurrentContextByState<T extends LoadState> = T extends LoadState.Idle
    ? IdleContext
    : T extends LoadState.LoadSchema
    ? IdleContext
    : T extends LoadState.SchemaReady
    ? SchemaReadyContext
    : T extends LoadState.LoadPlugin
    ? LoadPluginContext
    : T extends LoadState.Complete
    ? CompleteContext
    : AnyRecord;

type GetNextContextByState<T extends LoadState> = T extends LoadState.Idle
    ? IdleContext
    : T extends LoadState.LoadSchema
    ? SchemaReadyContext
    : T extends LoadState.SchemaReady
    ? LoadPluginContext
    : T extends LoadState.LoadPlugin
    ? CompleteContext
    : T extends LoadState.Complete
    ? CompleteContext
    : AnyRecord;

export abstract class Atom<
    LoadAfter extends LoadState = LoadState,
    Options extends AnyRecord = AnyRecord,
    CurrentContext extends AnyRecord = GetCurrentContextByState<LoadAfter>,
    NextContext extends AnyRecord = GetNextContextByState<LoadAfter>,
> {
    context!: Readonly<CurrentContext>;
    updateContext!: (next: Partial<NextContext>) => void;
    constructor(public readonly options: Options = {} as Options) {}
    injectContext(context: CurrentContext, updateContext: (next: Partial<NextContext>) => void) {
        this.context = context;
        this.updateContext = updateContext;
    }

    abstract readonly id: string;
    abstract readonly loadAfter: LoadAfter;
    abstract main(): void;
}

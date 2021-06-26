import { IdleContext, LoadPluginContext, CompleteContext, SchemaReadyContext } from '../editor';
import { LoadState } from '../constant';
import { AnyRecord } from '../utility';

export type GetCurrentContextByState<T extends LoadState> = T extends LoadState.Idle
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

export type GetNextContextByState<T extends LoadState> = T extends LoadState.Idle
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

import { createTiming } from '../timing';

export const Idle = createTiming('idle');
export const LoadSchema = createTiming('loadSchema');
export const SchemaReady = createTiming('schemaReady');
export const LoadPlugin = createTiming('loadPlugin');
export const Complete = createTiming('complete');

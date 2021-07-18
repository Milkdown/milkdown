import type { MilkdownPlugin } from '../utility';
import { createTiming } from '../timing';
import { SchemaReady } from '.';

export const Initialize = createTiming('Initialize');
export const Complete = createTiming('complete');

export const init: MilkdownPlugin = () => async () => {
    Initialize.done();

    await SchemaReady();

    Complete.done();
};

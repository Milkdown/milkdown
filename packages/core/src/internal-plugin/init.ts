import { Initialize } from '../constant';
import type { MilkdownPlugin } from '../utility';

export const init: MilkdownPlugin = () => () => {
    Initialize.done();
};

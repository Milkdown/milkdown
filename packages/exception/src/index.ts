export const docTypeError = (type: unknown) => new Error(`Doc type error, unsupported type: ${JSON.stringify(type)}`);

export const contextNotFound = () => new Error('Context not found, do you forget to inject it?');

export const timerNotFound = () => new Error('Timer not found, do you forget to record it?');

export const ctxCallOutOfScope = () => new Error('Should not call a context out of the plugin.');

export const createNodeInParserFail = (...args: unknown[]) => {
    const message = args.reduce((msg, arg) => {
        if (!arg) {
            return msg;
        }
        return `${msg}, ${JSON.stringify(arg)}`;
    }, 'Create prosemirror node from remark failed in parser') as string;

    return new Error(message);
};

export const stackOverFlow = () => new Error('Stack over flow, cannot pop on an empty stack.');

export const parserMatchError = (node: unknown) =>
    new Error(`Cannot match target parser for node: ${JSON.stringify(node)}.`);

export const serializerMatchError = (node: unknown) =>
    new Error(`Cannot match target serializer for node: ${JSON.stringify(node)}.`);

export const getAtomFromSchemaFail = (type: 'mark' | 'node', name: string) =>
    new Error(`Cannot get ${type}: ${name} from schema.`);

export const expectDomTypeError = (node: unknown) => new Error(`Expect to be a dom, but get: ${JSON.stringify(node)}.`);

import { Node } from 'prosemirror-model';
import { State } from './state';

test('.ensureNewLine', () => {
    const state = new State({}, {});
    state.ensureNewLine();
    expect(state.output).toBe('');

    state.write('abc').ensureNewLine();
    expect(state.output).toBe('abc\n');

    state.ensureNewLine();
    expect(state.output).toBe('abc\n');
});

test('.closeBlock', () => {
    const state = new State({}, {});
    const node = new Node();
    state.write();
    expect(state.output).toBe('');
    state.closeBlock(node).write();
    expect(state.output).toBe('\n');
});

test('.write', () => {
    const state = new State({}, {});
    state.write('abc');
    expect(state.output).toBe('abc');
});

describe('wrapBlock', () => {
    test('no firstDelimitation', () => {
        const state = new State({}, {});
        state.wrapBlock('>> ', new Node(), () => {
            state.write('abc');
        });
        expect(state.output).toBe('>> abc');
    });

    test('with firstDelimitation', () => {
        const state = new State({}, {});
        state.wrapBlock(
            '>> ',
            new Node(),
            () => {
                state.ensureNewLine().write('abc');
            },
            ':prefix:',
        );
        expect(state.output).toBe(':prefix:\n>> abc');
    });
});

describe('text', () => {
    test('single line not escape', () => {
        const state = new State({}, {});
        state.text('**abc**');
        expect(state.output).toBe('**abc**');
    });

    test('multi line not escape', () => {
        const state = new State({}, {});
        state.text('**abc**\n__def__\n');
        expect(state.output).toBe('**abc**\n__def__\n');
    });

    test('single line with escape', () => {
        const state = new State({}, {});
        state.write('*abc');
        state.text('**abc**', true);
        expect(state.output).toBe('*abc\\*\\*abc\\*\\*');
    });

    test('multi line with escape', () => {
        const state = new State({}, {});
        state.closeBlock(new Node());
        state.text('**abc**\n__def--', true);
        expect(state.output).toBe('\n\\*\\*abc\\*\\*\n__def--');
    });
});

describe('renderInline', () => {
    const textNodeFactory = (text: string) =>
        ({
            isText: true,
            text,
        } as Node);
    const parentFactory = (content: Node[]) => {
        const parent = {} as Node;
        parent.forEach = (fn: (node: Node, offset: number, index: number) => void) => {
            content.forEach((node, i) => fn(node, 0, i));
        };
        return parent;
    };
    test('renderInline without marks', () => {
        const state = new State({}, {});
        const parent = parentFactory([textNodeFactory('This'), textNodeFactory(' is '), textNodeFactory('test')]);
        state.renderInline(parent);
        expect(state.output).toBe('This is test');
    });
});

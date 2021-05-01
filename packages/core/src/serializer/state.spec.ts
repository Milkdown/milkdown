import { Mark, Node } from 'prosemirror-model';
import { State } from './state';

const textNodeFactory = (name: string, text: string, marks?: Mark[]) =>
    ({
        type: {
            name,
        },
        isText: true,
        text,
        marks,
    } as Node);
const parentFactory = (name: string, content: Node[]) => {
    const parent = {
        type: {
            name,
        },
    } as Node;
    parent.forEach = (fn: (node: Node, offset: number, index: number) => void) => {
        content.forEach((node, i) => fn(node, 0, i));
    };
    return parent;
};
const strongMark = { type: { name: 'strong' } } as Mark;
const italicMark = { type: { name: 'italic' } } as Mark;

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
    test('renderInline without marks', () => {
        const state = new State({}, {});
        const parent = parentFactory('', [
            textNodeFactory('text', 'This'),
            textNodeFactory('text', ' is '),
            textNodeFactory('text', 'test'),
        ]);
        state.renderInline(parent);
        expect(state.output).toBe('This is test');
    });

    test('renderInline with single marks', () => {
        const state = new State(
            {},
            {
                strong: {
                    open: '**',
                    close: '**',
                },
                italic: {
                    open: '*',
                    close: '*',
                },
            },
        );
        const parent = parentFactory('', [
            textNodeFactory('text', 'This '),
            textNodeFactory('text', 'is ', [strongMark]),
            textNodeFactory('text', 'test', [strongMark]),
        ]);
        state.renderInline(parent);
        expect(state.output).toBe('This **is test**');
    });

    test('renderInline with multiple marks', () => {
        const state = new State(
            {},
            {
                strong: {
                    open: '**',
                    close: '**',
                },
                italic: {
                    open: '*',
                    close: '*',
                },
            },
        );
        const parent = parentFactory('', [
            textNodeFactory('text', 'This '),
            textNodeFactory('text', 'is ', [strongMark]),
            textNodeFactory('text', 'test', [italicMark, strongMark]),
        ]);
        state.renderInline(parent);
        expect(state.output).toBe('This **is *test***');
    });
});

describe('renderList', () => {
    test('renderList with same delimitation', () => {
        const state = new State(
            {
                text: (state, node) => {
                    if (node.text) {
                        state.text(node.text);
                    }
                },
            },
            {},
        );
        const parent = parentFactory('parent', [
            textNodeFactory('text', 'list item 1\nparagraph1'),
            textNodeFactory('text', 'list item 2\nparagraph2'),
            textNodeFactory('text', 'list item 3\nparagraph3'),
        ]);
        state.renderList(parent, '>>', () => '_');
        expect(state.output).toBe(
            '_list item 1\n>>paragraph1\n\n_list item 2\n>>paragraph2\n\n_list item 3\n>>paragraph3',
        );
    });
});

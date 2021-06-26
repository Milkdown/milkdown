import type { MarkType, NodeType, Mark, Node } from 'prosemirror-model';
import { Stack } from './stack';
import type { AnyRecord } from '../utility';
import type { Attrs } from './types';

const createMockNodeType = (name: string) => {
    const mockNode: AnyRecord = {
        type: {
            name,
        },
    };

    return {
        createAndFill(attrs: AnyRecord, content?: Node[], marks?: Mark[]) {
            mockNode.attrs = attrs;
            mockNode.content = content;
            mockNode.marks = marks;
            return { ...mockNode } as Node;
        },
    } as NodeType;
};

const createMockMarkType = (name: string) => {
    const mockMark: AnyRecord = {
        type: {
            name,
        },
    };
    return {
        create(attrs: Attrs) {
            mockMark.attrs = attrs;
            mockMark.addToSet = (marks: Mark[]) => {
                return marks.concat(mockMark as Mark);
            };

            return { ...mockMark } as Mark;
        },
    } as MarkType;
};

const textNodeType = createMockNodeType('text');
const rootNodeType = createMockNodeType('root');
const createText = (content: string) => (marks: Mark[]) => {
    const text = textNodeType.createAndFill({}, [], marks) as Node;
    text.isText = true;
    text.text = content;
    text.withText = (str: string) => {
        return {
            ...text,
            text: str,
        } as Node & { text: string };
    };
    return text;
};

describe('Parser/Stack', () => {
    let stack: Stack;

    beforeEach(() => {
        stack = new Stack(rootNodeType);
    });

    it('add to top node', () => {
        const childNodeType = createMockNodeType('child');

        const childNode = stack.addNode(childNodeType);
        expect(childNode.type.name).toBe('child');

        const doc = stack.buildDoc();
        expect(doc.type.name).toEqual('root');
        expect(doc.content).toEqual([childNode]);
    });

    it('add a node structure', () => {
        const middleNodeType = createMockNodeType('middle');
        stack.openNode(middleNodeType);

        const childNodeType = createMockNodeType('child');
        const childNode = stack.addNode(childNodeType);

        const middleNode = stack.closeNode();
        expect(middleNode.content).toEqual([childNode]);

        const doc = stack.buildDoc();
        expect(doc.content).toEqual([middleNode]);
    });

    it('add a mark', () => {
        const childNodeType = createMockNodeType('child');
        stack.addNode(childNodeType);

        const strongMarkType = createMockMarkType('strong');
        stack.openMark(strongMarkType);
        stack.addText(createText('foo'));
        const doc = stack.buildDoc();

        const children: Node[] = doc.content as unknown as Node[];
        expect(children[0].type.name).toEqual('child');
        expect(children[1].type.name).toEqual('text');
        expect(children[1].text).toBe('foo');
        expect(children[1].marks[0].type.name).toEqual('strong');
    });

    it('add merged mark', () => {
        const childNodeType = createMockNodeType('child');
        stack.openNode(childNodeType);

        const strongMarkType = createMockMarkType('strong');
        stack.openMark(strongMarkType);
        stack.addText(createText('foo'));
        stack.addText(createText('bar'));
        const doc = stack.buildDoc();

        const firstChild: Node = (doc.content as unknown as Node[])[0];
        expect(firstChild.type.name).toEqual('child');
        const texts: Node[] = firstChild.content as unknown as Node[];

        expect(texts).toHaveLength(1);
        expect(texts[0].type.name).toEqual('text');
        expect(texts[0].text).toBe('foobar');
        expect(texts[0].marks[0].type.name).toEqual('strong');
    });
});

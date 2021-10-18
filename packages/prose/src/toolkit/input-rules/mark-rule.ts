/* Copyright 2021, Milkdown by Mirone. */
import { InputRule } from 'prosemirror-inputrules';
import { Mark, MarkType } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

export function markRule(regexp: RegExp, markType: MarkType): InputRule {
    return new InputRule(regexp, (state, match, start, end) => {
        const { tr } = state;
        const matchLength = match.length;

        let markStart = start;
        let markEnd = end;

        if (match[matchLength - 1]) {
            const first = match[0] as string;
            const last = match[matchLength - 1] as string;
            const last1 = match[matchLength - 2] as string;

            const matchStart = start + first.indexOf(last1);
            const matchEnd = matchStart + last1.length - 1;
            const textStart = matchStart + last1.lastIndexOf(last);
            const textEnd = textStart + last.length;

            const excludedMarks = getMarksBetween(start, end, state)
                .filter((item) => item.mark.type.excludes(markType))
                .filter((item) => item.end > matchStart);

            if (excludedMarks.length) {
                return null;
            }

            if (textEnd < matchEnd) {
                tr.delete(textEnd, matchEnd);
            }
            if (textStart > matchStart) {
                tr.delete(matchStart, textStart);
            }
            markStart = matchStart;
            markEnd = markStart + last.length;
        }
        tr.addMark(markStart, markEnd, markType.create());
        tr.removeStoredMark(markType);
        return tr;
    });
}

function getMarksBetween(start: number, end: number, state: EditorState) {
    let marks: { start: number; end: number; mark: Mark }[] = [];

    state.doc.nodesBetween(start, end, (node, pos) => {
        marks = [
            ...marks,
            ...node.marks.map((mark) => ({
                start: pos,
                end: pos + node.nodeSize,
                mark,
            })),
        ];
    });

    return marks;
}

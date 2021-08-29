import { tableNodes as tableNodesSpecCreator } from 'prosemirror-tables';

export const schema = tableNodesSpecCreator({
    tableGroup: 'block',
    cellContent: 'paragraph',
    cellAttributes: {
        alignment: {
            default: 'left',
            getFromDOM: (dom) => (dom as HTMLElement).style.textAlign || 'left',
            setDOMAttr: (value, attrs) => {
                attrs.style = `text-align: ${value || 'left'}`;
            },
        },
    },
});

import { createTable } from '@milkdown/plugin-table';
import type { Node } from 'prosemirror-model';
import { WrappedAction } from './item';

export const config: Array<WrappedAction> = [
    {
        $: ['Large Heading', 'looks_one'],
        onCreate: (schema) => schema.node('heading', { level: 1 }),
        keyword: ['h1', 'large heading'],
        nodeName: 'heading',
    },
    {
        $: ['Medium Heading', 'looks_two'],
        onCreate: (schema) => schema.node('heading', { level: 2 }),
        keyword: ['h2', 'medium heading'],
        nodeName: 'heading',
    },
    {
        $: ['Small Heading', 'looks_3'],
        onCreate: (schema) => schema.node('heading', { level: 3 }),
        keyword: ['h3', 'small heading'],
        nodeName: 'heading',
    },
    {
        $: ['Bullet List', 'format_list_bulleted'],
        onCreate: (schema) => schema.node('bullet_list', undefined, schema.nodes.list_item.createAndFill() as Node),
        keyword: ['bullet list', 'ul'],
        nodeName: 'bullet_list',
    },
    {
        $: ['Ordered List', 'format_list_numbered'],
        onCreate: (schema) => schema.node('ordered_list', undefined, schema.nodes.list_item.createAndFill() as Node),
        keyword: ['ordered list', 'ol'],
        nodeName: 'ordered_list',
    },
    {
        $: ['Task List', 'checklist'],
        onCreate: (schema) =>
            schema.node('bullet_list', undefined, schema.nodes.task_list_item.createAndFill() as Node),
        keyword: ['task list', 'task'],
        nodeName: 'task_list_item',
    },
    {
        $: ['Image', 'image'],
        onCreate: (schema) =>
            schema.node('paragraph', undefined, schema.nodes.image.createAndFill({ src: '' }) as Node),
        keyword: ['image'],
        nodeName: 'image',
    },
    {
        $: ['Quote', 'format_quote'],
        onCreate: (schema) => schema.nodes.blockquote.createAndFill() as Node,
        keyword: ['quote', 'blockquote'],
        nodeName: 'blockquote',
    },
    {
        $: ['Table', 'table_chart'],
        onCreate: (schema) => createTable(schema),
        keyword: ['table'],
        nodeName: 'table',
    },
    {
        $: ['Code Fence', 'code'],
        onCreate: (schema) => schema.node('fence'),
        keyword: ['code'],
        nodeName: 'fence',
    },
    {
        $: ['Divide Line', 'horizontal_rule'],
        onCreate: (schema) => schema.node('hr'),
        keyword: ['divider', 'hr'],
        nodeName: 'hr',
    },
];

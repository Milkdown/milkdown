import { createTable } from '@milkdown/plugin-table';
import type { Node } from 'prosemirror-model';
import { WrappedAction } from './item';
import { createDropdownItem, nodeExists } from './utility';

export const config: Array<WrappedAction> = [
    {
        dom: createDropdownItem('Large Heading', 'looks_one'),
        onCreate: (schema) => schema.node('heading', { level: 1 }),
        keyword: ['h1', 'large heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Medium Heading', 'looks_two'),
        onCreate: (schema) => schema.node('heading', { level: 2 }),
        keyword: ['h2', 'medium heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Small Heading', 'looks_3'),
        onCreate: (schema) => schema.node('heading', { level: 3 }),
        keyword: ['h3', 'small heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Bullet List', 'format_list_bulleted'),
        onCreate: (schema) => schema.node('bullet_list', undefined, schema.nodes.list_item.createAndFill() as Node),
        keyword: ['bullet list', 'ul'],
        enable: nodeExists('bullet_list'),
    },
    {
        dom: createDropdownItem('Ordered List', 'format_list_numbered'),
        onCreate: (schema) => schema.node('ordered_list', undefined, schema.nodes.list_item.createAndFill() as Node),
        keyword: ['ordered list', 'ol'],
        enable: nodeExists('ordered_list'),
    },
    {
        dom: createDropdownItem('Task List', 'checklist'),
        onCreate: (schema) =>
            schema.node('bullet_list', undefined, schema.nodes.task_list_item.createAndFill() as Node),
        keyword: ['task list', 'task'],
        enable: nodeExists('task_list_item'),
    },
    {
        dom: createDropdownItem('Image', 'image'),
        onCreate: (schema) =>
            schema.node('paragraph', undefined, schema.nodes.image.createAndFill({ src: '' }) as Node),
        keyword: ['image'],
        enable: nodeExists('image'),
        selectionType: 'node',
    },
    {
        dom: createDropdownItem('Quote', 'format_quote'),
        onCreate: (schema) => schema.nodes.blockquote.createAndFill() as Node,
        keyword: ['quote', 'blockquote'],
        enable: nodeExists('blockquote'),
    },
    {
        dom: createDropdownItem('Table', 'table_chart'),
        onCreate: (schema) => createTable(schema),
        keyword: ['table'],
        enable: nodeExists('table'),
    },
    {
        dom: createDropdownItem('Code Fence', 'code'),
        onCreate: (schema) => schema.node('fence'),
        keyword: ['code'],
        enable: nodeExists('fence'),
    },
    {
        dom: createDropdownItem('Divide Line', 'horizontal_rule'),
        onCreate: (schema) => schema.node('hr'),
        keyword: ['divider', 'hr'],
        enable: nodeExists('hr'),
    },
];

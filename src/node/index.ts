import { Paragraph } from './paragraph';
import { Blockquote } from './blockquote';
import { Heading } from './heading';
import { Image } from './image';
import { Hr } from './hr';
import { BulletList } from './bullet-list';
import { ListItem } from './list-item';
import { OrderedList } from './ordered-list';

export const nodes = [
    new Paragraph(),
    new Blockquote(),
    new OrderedList(),
    new BulletList(),
    new ListItem(),
    new Heading(),
    new Hr(),
    new Image(),
];

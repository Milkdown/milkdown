/* Copyright 2021, Milkdown by Mirone. */

export const linkRegexp = /\[(?<span>((www|https:\/\/|http:\/\/)\S+))]\((?<url>\S+)\)/;

export const punctuationRegexp = (holePlaceholder: string) =>
    new RegExp(`\\\\(?=[^\\w\\s${holePlaceholder}\\\\]|_)`, 'g');

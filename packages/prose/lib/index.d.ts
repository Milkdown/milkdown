import { InputRule } from 'prosemirror-inputrules';
import { PluginKey, Plugin, Transaction, Selection } from 'prosemirror-state';
import { Attrs, MarkType, NodeType, Node, ResolvedPos, Schema } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

/**
 * Copy paste from:
 * https://github.com/ProseMirror/prosemirror-view/blob/master/src/browser.ts
 */
declare const ie: boolean;
declare const ie_version: unknown;
declare const gecko: boolean;
declare const gecko_version: number | false;
declare const chrome: boolean;
declare const chrome_version: number;
declare const safari: boolean;
declare const ios: boolean;
declare const mac: boolean;
declare const android: boolean;
declare const webkit: boolean;
declare const webkit_version: number;

declare const browser_android: typeof android;
declare const browser_chrome: typeof chrome;
declare const browser_chrome_version: typeof chrome_version;
declare const browser_gecko: typeof gecko;
declare const browser_gecko_version: typeof gecko_version;
declare const browser_ie: typeof ie;
declare const browser_ie_version: typeof ie_version;
declare const browser_ios: typeof ios;
declare const browser_mac: typeof mac;
declare const browser_safari: typeof safari;
declare const browser_webkit: typeof webkit;
declare const browser_webkit_version: typeof webkit_version;
declare namespace browser {
  export { browser_android as android, browser_chrome as chrome, browser_chrome_version as chrome_version, browser_gecko as gecko, browser_gecko_version as gecko_version, browser_ie as ie, browser_ie_version as ie_version, browser_ios as ios, browser_mac as mac, browser_safari as safari, browser_webkit as webkit, browser_webkit_version as webkit_version };
}

declare const customInputRulesKey: PluginKey<any>;
declare function customInputRules({ rules }: {
    rules: InputRule[];
}): Plugin;

interface Captured {
    group: string | undefined;
    fullMatch: string;
    start: number;
    end: number;
}
interface BeforeDispatch {
    match: string[];
    start: number;
    end: number;
    tr: Transaction;
}
interface Options {
    getAttr?: (match: RegExpMatchArray) => Attrs;
    updateCaptured?: (captured: Captured) => Partial<Captured>;
    beforeDispatch?: (options: BeforeDispatch) => void;
}

declare function markRule(regexp: RegExp, markType: MarkType, options?: Options): InputRule;

declare function nodeRule(regexp: RegExp, nodeType: NodeType, options?: Options): InputRule;

type Point = [top: number, left: number];
declare function calculateNodePosition(view: EditorView, target: HTMLElement, handler: (selectedRect: DOMRect, targetRect: DOMRect, parentRect: DOMRect) => Point): void;
interface Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
declare function calculateTextPosition(view: EditorView, target: HTMLElement, handler: (start: Rect, end: Rect, targetRect: DOMRect, parentRect: DOMRect) => Point): void;
declare function posToDOMRect(view: EditorView, from: number, to: number): DOMRect;

declare function cloneTr(tr: Transaction): Transaction;
declare function equalNodeType(nodeType: NodeType | NodeType[], node: Node): boolean;

type Predicate = (node: Node) => boolean;

interface NodeWithPos {
    pos: number;
    node: Node;
}
interface NodeWithFromTo {
    from: number;
    to: number;
    node: Node;
}
declare function flatten(node: Node, descend?: boolean): NodeWithPos[];
declare function findChildren(predicate: Predicate): (node: Node, descend?: boolean) => NodeWithPos[];
declare function findChildrenByMark(node: Node, markType: MarkType, descend?: boolean): NodeWithPos[];
declare function findParent(predicate: Predicate): ($pos: ResolvedPos) => NodeWithFromTo | undefined;
declare function findParentNodeType($pos: ResolvedPos, nodeType: NodeType): NodeWithFromTo | undefined;

declare function getNodeFromSchema(type: string, schema: Schema): NodeType;
declare function getMarkFromSchema(type: string, schema: Schema): MarkType;

interface ContentNodeWithPos {
    pos: number;
    start: number;
    depth: number;
    node: Node;
}
declare function findParentNodeClosestToPos(predicate: Predicate): ($pos: ResolvedPos) => ContentNodeWithPos | undefined;
declare function findParentNode(predicate: Predicate): (selection: Selection) => ContentNodeWithPos | undefined;
declare function findSelectedNodeOfType(selection: Selection, nodeType: NodeType): ContentNodeWithPos | undefined;

export { type BeforeDispatch, type Captured, type ContentNodeWithPos, type NodeWithFromTo, type NodeWithPos, type Options, browser, calculateNodePosition, calculateTextPosition, cloneTr, customInputRules, customInputRulesKey, equalNodeType, findChildren, findChildrenByMark, findParent, findParentNode, findParentNodeClosestToPos, findParentNodeType, findSelectedNodeOfType, flatten, getMarkFromSchema, getNodeFromSchema, markRule, nodeRule, posToDOMRect };
//# sourceMappingURL=index.d.ts.map

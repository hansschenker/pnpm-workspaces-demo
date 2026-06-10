import { createElement, Fragment, type Child, type Component, type Props } from './index.js';

export { Fragment };

export function jsx(type: string | Component, props: Props): Node {
    return createElement(type, props);
}

export const jsxs = jsx;

interface HtmlProps {
    [attribute: string]: unknown;
    children?: Child;
    style?: Partial<CSSStyleDeclaration> | string;
}

export namespace JSX {
    export type Element = Node;
    export interface ElementChildrenAttribute {
        children: unknown;
    }
    export interface IntrinsicElements {
        [tagName: string]: HtmlProps;
    }
}

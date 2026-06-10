import { createElement, Fragment, type Component, type Props } from './index.js';

export { Fragment };
export type { JSX } from './jsx-runtime.js';

export function jsxDEV(type: string | Component, props: Props): Node {
    return createElement(type, props);
}

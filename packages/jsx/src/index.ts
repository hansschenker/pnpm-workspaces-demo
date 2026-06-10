type Primitive = string | number | bigint | boolean | null | undefined;

export type Child = Node | Primitive | Child[];

export interface Props {
    [name: string]: unknown;
    children?: Child;
}

export type Component<P extends Props = Props> = (props: P) => Node;

export function createElement(type: string | Component, props: Props): Node {
    if (typeof type === 'function') {
        return type(props);
    }

    const element = document.createElement(type);

    for (const [name, value] of Object.entries(props)) {
        if (name === 'children' || value == null || value === false) {
            continue;
        }
        if (name.startsWith('on') && typeof value === 'function') {
            element.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
        } else if (name === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (name === 'class' || name === 'className') {
            element.setAttribute('class', String(value));
        } else {
            element.setAttribute(name, value === true ? '' : String(value));
        }
    }

    appendChild(element, props.children);

    return element;
}

export function Fragment(props: Props): DocumentFragment {
    const fragment = document.createDocumentFragment();
    appendChild(fragment, props.children);
    return fragment;
}

function appendChild(parent: Node, child: Child): void {
    if (child == null || typeof child === 'boolean') {
        return;
    }
    if (Array.isArray(child)) {
        for (const item of child) {
            appendChild(parent, item);
        }
        return;
    }
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
}

export function render(node: Node, container: Element): void {
    container.replaceChildren(node);
}

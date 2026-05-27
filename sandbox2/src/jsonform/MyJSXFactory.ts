import { CDSButton } from '@carbon/web-components';

type EventListener = (e: Event) => void;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      image: any;
      div: Partial<HTMLDivElement>;
      span: Partial<HTMLSpanElement>;
      'cds-button': Partial<CDSButton>;
    }
  }
}

export function createDomFragment(props: { children: Element[] }): any {
  throw 'NOT USED';
}

export function createDomElement(
  tagName: any,
  attributes: Record<string, string | EventListener> | null,
  ...children: Node[]
): Element | DocumentFragment {
  if (typeof tagName === 'function') {
    const f = document.createDocumentFragment();
    for (const c of children) {
      f.append(c);
    }
    return f;
  }
  if (typeof tagName !== 'string') {
    throw 'unknown tagName ' + tagName;
  }
  const element = document.createElement(tagName);
  if (attributes) {
    for (const key of Object.keys(attributes)) {
      const attributeValue = attributes[key];

      if (key === 'className' && typeof attributeValue === 'string') {
        // JSX does not allow class as a valid name
        element.setAttribute('class', attributeValue);
      } else if (key.startsWith('on') && typeof attributeValue === 'function') {
        element.addEventListener(key.substring(2), attributeValue);
      } else {
        // <input disable />      { disable: true }
        // <input type="text" />  { type: "text"}
        if (typeof attributeValue === 'boolean' && attributeValue) {
          element.setAttribute(key, '');
        } else if (typeof attributeValue === 'string') {
          element.setAttribute(key, attributeValue);
        } else {
          throw 'Unsupported attribute ' + key;
        }
      }
    }
  }

  for (const child of children) {
    appendChild(element, child);
  }

  return element;
}

function appendChild(parent: Node, child: any) {
  if (typeof child === 'undefined' || child === null) {
    return;
  }

  if (Array.isArray(child)) {
    for (const value of child) {
      appendChild(parent, value);
    }
  } else if (typeof child === 'string') {
    parent.appendChild(document.createTextNode(child));
  } else if (child instanceof Node) {
    parent.appendChild(child);
  } else if (typeof child === 'boolean') {
    // <>{condition && <a>Display when condition is true</a>}</>
    // if condition is false, the child is a boolean, but we don't want to display anything
  } else {
    parent.appendChild(document.createTextNode(String(child)));
  }
}

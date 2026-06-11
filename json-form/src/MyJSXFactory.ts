import {
  CDSButton,
  CDSModal,
  CDSModalBody,
  CDSModalBodyContent,
  CDSModalCloseButton,
  CDSModalFooter,
  CDSModalFooterButton,
  CDSModalHeader,
  CDSModalHeading,
  CDSRadioButton,
  CDSRadioButtonGroup,
  CDSTag,
  CDSTextInput,
  CDSTable,
  CDSTableBody,
  CDSTableCell,
  CDSTableHead,
  CDSTableHeaderCell,
  CDSTableHeaderRow,
  CDSTableRow,
} from '@carbon/web-components';

type EventListener = (e: Event) => void;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      image: any;
      div: Partial<HTMLDivElement>;
      span: Partial<HTMLSpanElement>;
      ul: Partial<HTMLUListElement>;
      li: Partial<HTMLLIElement>;
      button: Partial<HTMLButtonElement>;
      p: Partial<HTMLParagraphElement>;
      'cds-button': Partial<CDSButton>;
      'cds-modal': Partial<CDSModal>;
      'cds-modal-header': Partial<CDSModalHeader>;
      'cds-modal-close-button': Partial<CDSModalCloseButton>;
      'cds-modal-heading': Partial<CDSModalHeading>;
      'cds-modal-body': Partial<CDSModalBody>;
      'cds-modal-body-content': Partial<CDSModalBodyContent>;
      'cds-modal-footer': Partial<CDSModalFooter>;
      'cds-modal-footer-button': Partial<CDSModalFooterButton>;
      'cds-text-input': Partial<CDSTextInput>;
      'cds-radio-button-group': Partial<CDSRadioButtonGroup>;
      'cds-radio-button': Partial<CDSRadioButton>;
      'cds-tag': Partial<CDSTag>;
      'cds-table': Partial<CDSTable>;
      'cds-table-head': Partial<CDSTableHead>;
      'cds-table-header-row': Partial<CDSTableHeaderRow>;
      'cds-table-header-cell': Partial<CDSTableHeaderCell>;
      'cds-table-body': Partial<CDSTableBody>;
      'cds-table-row': Partial<CDSTableRow>;
      'cds-table-cell': Partial<CDSTableCell>;
    }
  }
}

export const Fragment = () => {
  throw 'NOT CALLED';
};

export function h(
  tagName: string | typeof Fragment,
  attributes: Record<string, string | EventListener> | null,
  ...children: Node[]
): Element | DocumentFragment {
  if (tagName === Fragment) {
    const f = document.createDocumentFragment();
    for (const c of children) {
      f.append(c);
    }
    return f;
  }
  if (typeof tagName !== 'string') {
    throw 'tag is not a stting ' + tagName;
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
        if (typeof attributeValue === 'boolean') {
          if (attributeValue) {
            element.setAttribute(key, '');
          } else {
            element.removeAttribute(key);
          }
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

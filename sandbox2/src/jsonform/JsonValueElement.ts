import { RendererArgs } from './RendererArgs';
import { JsonNode, removeChildren, toJsonNode } from './util';

export class JsonValueElement extends HTMLElement {
  static TAG_NAME = 'json-value';

  constructor() {
    super();
  }

  render(args: RendererArgs) {
    removeChildren(this);
    const { value, path } = args;
    this.setAttribute('jf-path', path.format());
    switch (value.tag) {
      case 'string': {
        this.appendChild(renderString(value.value));
        break;
      }
      case 'number': {
        this.appendChild(renderNumber(value.value));
        break;
      }
      case 'boolean': {
        this.appendChild(renderBoolean(value.value));
        break;
      }
      case 'object': {
        this.appendChild(renderObject(args, value.value));
        break;
      }
      case 'array': {
        this.appendChild(renderArray(value.value));
        break;
      }
      case 'null': {
        this.appendChild(renderNull());
        break;
      }
    }
  }
}

function renderString(value: string): HTMLElement {
  const input = document.createElement('input') as HTMLInputElement;
  input.value = value;
  return input;
}

function renderNumber(value: number): HTMLElement {
  const input = document.createElement('input') as HTMLInputElement;
  input.value = value.toLocaleString();
  return input;
}

function renderBoolean(value: boolean): HTMLElement {
  const input = document.createElement('input') as HTMLInputElement;
  input.type = 'checkbox';
  input.checked = value;
  return input;
}

function renderObject(args: RendererArgs, obj: any): HTMLElement {
  const { path } = args;
  const wrapperElem = document.createElement('div');
  wrapperElem.style.display = 'grid';
  wrapperElem.style.gridTemplateColumns = '1fr 1fr';
  Object.keys(obj).forEach((key) => {
    const labelElem = document.createElement('div');
    labelElem.textContent = key;
    wrapperElem.appendChild(labelElem);

    const propValue = obj[key];
    const valueElem = document.createElement(
      JsonValueElement.TAG_NAME,
    ) as JsonValueElement;
    valueElem.render({
      path: path.append(key),
      value: toJsonNode(propValue),
    });
    wrapperElem.appendChild(valueElem);
  });
  return wrapperElem;
}

function renderArray(value: ReadonlyArray<any>): HTMLElement {
  throw 'renderArray';
}

function renderNull(): HTMLElement {
  const e = document.createElement('div');
  e.textContent = 'null';
  return e;
}

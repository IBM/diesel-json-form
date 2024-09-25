import {
  JvArray,
  JvBoolean,
  JvNumber,
  JvObject,
  JvString,
} from '@diesel-parser/json-form';
import { RendererArgs } from './RendererArgs';
import { removeChildren } from './util';

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
      case 'jv-string': {
        this.appendChild(renderString(args, value));
        break;
      }
      case 'jv-number': {
        this.appendChild(renderNumber(args, value));
        break;
      }
      case 'jv-boolean': {
        this.appendChild(renderBoolean(args, value));
        break;
      }
      case 'jv-object': {
        this.appendChild(renderObject(args, value));
        break;
      }
      case 'jv-array': {
        this.appendChild(renderArray(args, value));
        break;
      }
      case 'jv-null': {
        this.appendChild(renderNull());
        break;
      }
    }
  }
}

function renderString(args: RendererArgs, value: JvString): HTMLElement {
  const input = document.createElement('input') as HTMLInputElement;
  input.value = value.value;
  const { path, valueChanged } = args;
  input.addEventListener('input', () => {
    valueChanged(path);
  });
  return input;
}

function renderNumber(args: RendererArgs, value: JvNumber): HTMLElement {
  const input = document.createElement('input') as HTMLInputElement;
  input.value = value.value.toLocaleString();
  return input;
}

function renderBoolean(args: RendererArgs, value: JvBoolean): HTMLElement {
  const input = document.createElement('input') as HTMLInputElement;
  input.type = 'checkbox';
  input.checked = value.value;
  return input;
}

function renderObject(args: RendererArgs, obj: JvObject): HTMLElement {
  const { path, valueChanged } = args;
  const wrapperElem = document.createElement('div');
  wrapperElem.style.display = 'grid';
  wrapperElem.style.gridTemplateColumns = '1fr 1fr';
  obj.properties.forEach((property) => {
    const labelElem = document.createElement('div');
    labelElem.textContent = property.name;
    wrapperElem.appendChild(labelElem);
    const valueElem = document.createElement(
      JsonValueElement.TAG_NAME,
    ) as JsonValueElement;
    valueElem.render({
      path: path.append(property.name),
      value: property.value,
      valueChanged,
    });
    wrapperElem.appendChild(valueElem);
  });
  return wrapperElem;
}

function renderArray(args: RendererArgs, value: JvArray): HTMLElement {
  const { path, valueChanged } = args;
  const wrapperElem = document.createElement('div');
  wrapperElem.style.display = 'flex';
  wrapperElem.style.flexDirection = 'column';
  value.elems.forEach((item, itemIndex) => {
    const valueElem = document.createElement(
      JsonValueElement.TAG_NAME,
    ) as JsonValueElement;
    valueElem.render({
      path: path.append(itemIndex),
      value: item,
      valueChanged,
    });
    wrapperElem.appendChild(valueElem);
  });
  return wrapperElem;
}

function renderNull(): HTMLElement {
  const e = document.createElement('div');
  e.textContent = 'null';
  return e;
}

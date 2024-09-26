import {
  JsonValue,
  jvArray,
  JvArray,
  jvBool,
  JvBoolean,
  jvNull,
  JvNull,
  jvNumber,
  JvNumber,
  jvObject,
  JvObject,
  jvString,
  JvString,
} from '@diesel-parser/json-form';
import { RendererArgs } from './RendererArgs';
import { removeChildren } from './util';
import { Tuple } from 'tea-cup-core';

export interface JsonValueElement<T extends JsonValue> {
  getValue(): T;
}

export function renderValue(
  args: RendererArgs,
): JsonValueElement<JsonValue> & HTMLElement {
  const { value } = args;
  switch (value.tag) {
    case 'jv-string': {
      return JsonStringElement.newInstance(args, value);
    }
    case 'jv-number': {
      return JsonNumberElement.newInstance(args, value);
    }
    case 'jv-boolean': {
      return JsonBooleanElement.newInstance(args, value);
    }
    case 'jv-object': {
      return JsonObjectElement.newInstance(args, value);
    }
    case 'jv-array': {
      return JsonArrayElement.newInstance(args, value);
    }
    case 'jv-null': {
      return JsonNullElement.newInstance(args);
    }
  }
}

export class JsonStringElement
  extends HTMLElement
  implements JsonValueElement<JvString>
{
  static TAG_NAME = 'json-string';

  static newInstance(args: RendererArgs, value: JvString): JsonStringElement {
    const e = document.createElement(
      JsonStringElement.TAG_NAME,
    ) as JsonStringElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  private render(args: RendererArgs, value: JvString) {
    removeChildren(this);
    this._input.value = value.value;
    const { path, valueChanged } = args;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvString {
    return jvString(this._input.value);
  }
}

export class JsonNumberElement
  extends HTMLElement
  implements JsonValueElement<JvNumber>
{
  static TAG_NAME = 'json-number';

  static newInstance(args: RendererArgs, value: JvNumber): JsonNumberElement {
    const e = document.createElement(
      JsonNumberElement.TAG_NAME,
    ) as JsonNumberElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  private render(args: RendererArgs, value: JvNumber) {
    removeChildren(this);
    this._input.type = 'number';
    this._input.value = value.value.toLocaleString();
    const { path, valueChanged } = args;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvNumber {
    return jvNumber(this._input.valueAsNumber);
  }
}

export class JsonBooleanElement
  extends HTMLElement
  implements JsonValueElement<JvBoolean>
{
  static TAG_NAME = 'json-boolean';

  static newInstance(args: RendererArgs, value: JvBoolean): JsonBooleanElement {
    const e = document.createElement(
      JsonBooleanElement.TAG_NAME,
    ) as JsonBooleanElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _input: HTMLInputElement;

  constructor() {
    super();
    this._input = document.createElement('input') as HTMLInputElement;
  }

  private render(args: RendererArgs, value: JvBoolean) {
    removeChildren(this);
    this._input.type = 'checkbox';
    this._input.checked = value.value;
    const { path, valueChanged } = args;
    this._input.addEventListener('input', () => {
      valueChanged(path);
    });
    this.appendChild(this._input);
  }

  getValue(): JvBoolean {
    return jvBool(this._input.checked);
  }
}

export class JsonObjectElement
  extends HTMLElement
  implements JsonValueElement<JvObject>
{
  static TAG_NAME = 'json-object';

  static newInstance(args: RendererArgs, value: JvObject): JsonObjectElement {
    const e = document.createElement(
      JsonObjectElement.TAG_NAME,
    ) as JsonObjectElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _elems: Tuple<string, JsonValueElement<JsonValue>>[] = [];

  constructor() {
    super();
  }

  private render(args: RendererArgs, value: JvObject) {
    const { path, valueChanged } = args;
    const wrapperElem = document.createElement('div');
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr';
    value.properties.forEach((property) => {
      const labelElem = document.createElement('div');
      labelElem.textContent = property.name;
      wrapperElem.appendChild(labelElem);
      const valueElem = renderValue({
        path: path.append(property.name),
        value: property.value,
        valueChanged,
      });
      this._elems.push(Tuple.t2(property.name, valueElem));
      wrapperElem.appendChild(valueElem);
    });
    this.appendChild(wrapperElem);
  }

  getValue(): JvObject {
    return jvObject(
      this._elems.map((elem) => {
        return { name: elem.a, value: elem.b.getValue() };
      }),
    );
  }
}

export class JsonArrayElement
  extends HTMLElement
  implements JsonValueElement<JvArray>
{
  static TAG_NAME = 'json-array';

  static newInstance(args: RendererArgs, value: JvArray): JsonArrayElement {
    const e = document.createElement(
      JsonArrayElement.TAG_NAME,
    ) as JsonArrayElement;
    e.setAttribute('jf-path', args.path.format());
    e.render(args, value);
    return e;
  }

  private _elems: JsonValueElement<JsonValue>[] = [];

  constructor() {
    super();
  }

  private render(args: RendererArgs, value: JvArray) {
    const { path, valueChanged } = args;
    const wrapperElem = document.createElement('div');
    wrapperElem.style.display = 'flex';
    wrapperElem.style.flexDirection = 'column';
    value.elems.forEach((item, itemIndex) => {
      const valueElem = renderValue({
        path: path.append(itemIndex),
        value: item,
        valueChanged,
      });
      this._elems.push(valueElem);
      wrapperElem.appendChild(valueElem);
    });
    this.appendChild(wrapperElem);
  }

  getValue(): JvArray {
    return jvArray(this._elems.map((e) => e.getValue()));
  }
}

export class JsonNullElement
  extends HTMLElement
  implements JsonValueElement<JvNull>
{
  static TAG_NAME = 'json-null';

  static newInstance(args: RendererArgs): JsonNullElement {
    const e = document.createElement(
      JsonNullElement.TAG_NAME,
    ) as JsonNullElement;
    e.setAttribute('jf-path', args.path.format());
    e.render();
    return e;
  }

  constructor() {
    super();
  }

  private render() {
    this.textContent = 'null';
  }

  getValue(): JvNull {
    return jvNull;
  }
}

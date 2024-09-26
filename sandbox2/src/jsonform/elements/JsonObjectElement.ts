import { JvObject, JsonValue, jvObject } from '@diesel-parser/json-form';
import { Tuple } from 'tea-cup-core';
import { JsonValueElement, renderValue } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';

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

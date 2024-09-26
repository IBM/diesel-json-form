import { JvObject, JsonValue, jvObject } from '@diesel-parser/json-form';
import { Tuple } from 'tea-cup-core';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { renderValue } from '../RenderValue';

export class JsonObjectElement extends JsonValueElementBase<JvObject> {
  static TAG_NAME = 'json-object';

  static newInstance(): JsonObjectElement {
    const e = document.createElement(
      JsonObjectElement.TAG_NAME,
    ) as JsonObjectElement;
    return e;
  }

  private _elems: Tuple<string, JsonValueElement<JsonValue>>[] = [];

  constructor() {
    super();
  }

  protected doRender(args: RendererArgs, value: JvObject) {
    this.setAttribute('jf-path', args.path.format());
    const { path } = args;
    const wrapperElem = document.createElement('div');
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr';
    value.properties.forEach((property) => {
      const labelElem = document.createElement('div');
      labelElem.textContent = property.name;
      wrapperElem.appendChild(labelElem);
      const valueElem = renderValue({
        ...args,
        path: path.append(property.name),
        value: property.value,
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

import { JvArray, JsonValue, jvArray } from '@diesel-parser/json-form';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { renderValue } from '../RenderValue';

export class JsonArrayElement extends JsonValueElementBase<JvArray> {
  static TAG_NAME = 'json-array';

  static newInstance(): JsonArrayElement {
    const e = document.createElement(
      JsonArrayElement.TAG_NAME,
    ) as JsonArrayElement;
    return e;
  }

  private _elems: JsonValueElement<JsonValue>[] = [];

  constructor() {
    super();
  }

  protected doRender(args: RendererArgs, value: JvArray) {
    this.setAttribute('jf-path', args.path.format());
    const { path } = args;
    const wrapperElem = document.createElement('div');
    wrapperElem.style.display = 'flex';
    wrapperElem.style.flexDirection = 'column';
    value.elems.forEach((item, itemIndex) => {
      const valueElem = renderValue({
        ...args,
        path: path.append(itemIndex),
        value: item,
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

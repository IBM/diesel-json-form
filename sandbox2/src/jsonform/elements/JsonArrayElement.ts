import { JvArray, JsonValue, jvArray } from '@diesel-parser/json-form';
import { JsonValueElement, renderValue } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';

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

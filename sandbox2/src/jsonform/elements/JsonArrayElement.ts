import { JvArray, JsonValue, jvArray } from '@diesel-parser/json-form';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
import { renderValue } from '../RenderValue';
import { button, div, text } from '../HtmlBuilder';

interface ItemRow {
  readonly valueElem: JsonValueElement<JsonValue> & HTMLElement;
  readonly deleteButton: HTMLElement;
}

export class JsonArrayElement extends JsonValueElementBase<JvArray> {
  static TAG_NAME = 'json-array';

  static newInstance(): JsonArrayElement {
    const e = document.createElement(
      JsonArrayElement.TAG_NAME,
    ) as JsonArrayElement;
    return e;
  }

  private _elems: ItemRow[] = [];

  constructor() {
    super();
  }

  protected doRender(args: RendererArgs, value: JvArray) {
    const { path } = args;
    const wrapperElem = div({});
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr';

    value.elems.forEach((item, itemIndex) => {
      const valueElem = renderValue({
        ...args,
        path: path.append(itemIndex),
        value: item,
      });
      wrapperElem.appendChild(valueElem);
      const deleteButton = button({}, text('delete'));
      wrapperElem.appendChild(deleteButton);
      this._elems.push({
        valueElem,
        deleteButton,
      });
    });
    this.appendChild(wrapperElem);
  }

  getValue(): JvArray {
    return jvArray(this._elems.map((e) => e.valueElem.getValue()));
  }
}

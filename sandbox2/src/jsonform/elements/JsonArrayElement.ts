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
  private _wrapperElem: HTMLElement = div({});

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
      const itemRow = {
        valueElem,
        deleteButton,
      };
      this._elems.push(itemRow);
      deleteButton.addEventListener('click', () => {
        this.deleteItem(itemRow);
      });
    });
    this.appendChild(wrapperElem);
    this._wrapperElem = wrapperElem;
  }

  private deleteItem(itemRow: ItemRow) {
    const i = this._elems.indexOf(itemRow);
    if (i !== -1) {
      this._elems.splice(i, 1);
      this._wrapperElem.removeChild(itemRow.valueElem);
      this._wrapperElem.removeChild(itemRow.deleteButton);
      this.fireValueChanged();
    }
  }

  getValue(): JvArray {
    return jvArray(this._elems.map((e) => e.valueElem.getValue()));
  }
}

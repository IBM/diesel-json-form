import {
  JvArray,
  JsonValue,
  jvArray,
  jvNull,
  setValueAt,
  getProposals,
} from '@diesel-parser/json-form';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RendererArgs } from '../RendererArgs';
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
  private _addButtonElem: HTMLElement = div({ className: 'add-elem' });

  constructor() {
    super();
  }

  protected doRender(args: RendererArgs<JvArray>) {
    const wrapperElem = div({});
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr';
    const { value } = args;
    value.elems.forEach((item, itemIndex) => {
      const itemRow = this.createItemRow(args, item, itemIndex);
      this._elems.push(itemRow);
      wrapperElem.appendChild(itemRow.valueElem);
      wrapperElem.appendChild(itemRow.deleteButton);
      itemRow.deleteButton.addEventListener('click', () => {
        this.deleteItem(itemRow);
      });
    });
    this._addButtonElem.style.gridColumn = 'span 2';
    const addButton = button(
      {
        onclick: () => {
          this.addElem();
        },
      },
      text('add elem'),
    );
    this._addButtonElem.appendChild(addButton);
    wrapperElem.appendChild(this._addButtonElem);

    this._wrapperElem = wrapperElem;
    this.appendChild(wrapperElem);
  }

  private createItemRow(
    args: RendererArgs<JvArray>,
    item: JsonValue,
    itemIndex: number,
  ): ItemRow {
    const deleteButton = button({}, text('delete'));
    const { renderer } = args;
    const valueElem = renderer.render({
      ...args,
      path: args.path.append(itemIndex),
      value: item,
    });
    return {
      valueElem,
      deleteButton,
    };
  }

  private addElem() {
    if (this.schemaInfos && this.path) {
      const thisValue = this.getValue();
      const newValue = jvArray([...thisValue.elems, jvNull]);
      const root = this.schemaInfos.getRootValue();
      const newRoot = setValueAt(root, this.path, newValue);
      const validationResult = this.schemaInfos.validate(newRoot);
      const proposals = getProposals(
        validationResult,
        this.path.append(newValue.elems.length - 1),
        -1,
      );
      if (proposals.length > 0) {
        const proposal = proposals[0];
        console.log('proposal', proposal);
      }
      console.log(proposals);
    }
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

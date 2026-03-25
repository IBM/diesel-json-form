import {
  diffLists,
  JsonValue,
  JsPath,
  JvArray,
  jvArray,
  jvNull,
  setValueAt,
} from '@diesel-parser/json-form';
import { button, div, text } from '../HtmlBuilder';
import { JsonValueElement, JsonValueElementBase } from '../JsonValueElement';
import { RenderConfig } from '../RendererConfig';
import { detectSingleUpdate } from './detectSingleUpdate';

interface ItemRow {
  readonly item: JsonValue;
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

  protected doRender(config: RenderConfig, path: JsPath, value: JvArray) {
    const wrapperElem = div({});
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr';
    value.elems.forEach((item, itemIndex) => {
      const itemRow = this.createItemRow(config, path, item, itemIndex);
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
    config: RenderConfig,
    path: JsPath,
    item: JsonValue,
    itemIndex: number,
  ): ItemRow {
    const deleteButton = button({}, text('delete'));
    const { renderer } = config;
    const valueElem = renderer.render(config, path.append(itemIndex), item);
    return {
      item,
      valueElem,
      deleteButton,
    };
  }

  private addElem() {
    const elems = this._elems.map((e) => e.item);
    const newValue = jvArray([...elems, jvNull]);
    if (this.schemaInfos) {
      const root = this.schemaInfos.rootValue;
      const newRoot = setValueAt(root, this.path, newValue);
      const service = this.schemaInfos.schemaService;
      const schema = this.schemaInfos.schema;
      const validationResult = service.validate(schema, newRoot);
      const proposals = validationResult.propose(
        this.path.append(newValue.elems.length - 1),
        -1,
      );
      if (proposals.length > 0) {
        const newValue2 = jvArray([...elems, proposals[0]]);
        this.fireValueChanged(newValue2);
      }
    }
  }

  private deleteItem(itemRow: ItemRow) {
    const elems = this._elems.map((e) => e.item);
    const newElems = elems.filter((e) => e !== itemRow.item);
    this.fireValueChanged(jvArray(newElems));
  }

  protected doReRender(
    config: RenderConfig,
    path: JsPath,
    value: JvArray,
  ): void {
    const oldElems = this._elems.map((e) => e.item);

    const diff0 = diffLists(oldElems, value.elems);
    // console.log('FW diff0', diff0);
    const diff = detectSingleUpdate(diff0);
    // console.log('FW diff', diff);

    const newThisElems = [];
    for (const change of diff.changes) {
      switch (change.type) {
        case 'common': {
          newThisElems[change.rightIndex] = this._elems[change.leftIndex];
          newThisElems[change.rightIndex].valueElem.reRender(
            config,
            path.append(change.rightIndex),
            change.value,
          );
          break;
        }
        case 'add': {
          const itemRow = this.createItemRow(
            config,
            path,
            value.elems[change.rightIndex],
            change.rightIndex,
          );
          //   itemRow.deleteButton.addEventListener('click', () => {
          //     this.deleteItem(itemRow);
          //   });
          newThisElems[change.rightIndex] = itemRow;
          break;
        }
        case 'remove': {
          this._elems[change.leftIndex].valueElem.remove();
          this._elems[change.leftIndex].deleteButton.remove();
          break;
        }
      }
    }

    const wrapperElem = div({});
    wrapperElem.style.display = 'grid';
    wrapperElem.style.gridTemplateColumns = '1fr 1fr';
    newThisElems.forEach((itemRow) => {
      wrapperElem.appendChild(itemRow.valueElem);
      wrapperElem.appendChild(itemRow.deleteButton);
      itemRow.deleteButton.addEventListener('click', () => {
        this.deleteItem(itemRow);
      });
    });
    wrapperElem.appendChild(this._addButtonElem);

    this._elems = newThisElems;
    this._wrapperElem.remove();
    this._wrapperElem = wrapperElem;
    this.appendChild(wrapperElem);
  }
}

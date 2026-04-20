import { JsonValue, jvArray, JvArray } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { table, tbody, td, tr } from './HtmlBuilder';
import { createDom } from './createDom';

export class JsonArrayElement extends JsonElement<JvArray> {
  static TAG_NAME = 'json-array';

  private table?: HTMLTableElement;

  constructor() {
    super();
  }

  toValue(): JvArray {
    if (this.table) {
      const rows = this.table.querySelectorAll('tbody > tr');
      const elems: JsonValue[] = [];
      rows.forEach((tr) => {
        const cell = tr.querySelector('* > td');
        if (cell) {
          const cellElem = cell.firstChild;
          if (cellElem && cellElem instanceof JsonElement) {
            elems.push(cellElem.toValue());
          }
        }
      });
      return jvArray(elems);
    } else {
      return jvArray();
    }
  }

  fromValue(value: JvArray): void {
    if (this.table) {
      this.removeChild(this.table);
    }
    const newTable = table({}, [
      tbody(
        {},
        value.elems.map((elem) => tr({}, [td({}, [createDom(elem)])])),
      ),
    ]);
    this.table = newTable;
    this.appendChild(newTable);
  }
}

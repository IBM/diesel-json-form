import { JsonValue, JsPath, jvArray, JvArray } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { table, tbody, td, tr } from './HtmlBuilder';
import { createDom } from './createDom';
import { ValidationData } from './ValidationData';

export class JsonArrayElement extends JsonElement<JvArray> {
  static TAG_NAME = 'json-array';

  private table?: HTMLTableElement;

  constructor() {
    super();
  }

  private findElems(): readonly JsonElement<JsonValue>[] {
    if (this.table) {
      const rows = this.table.querySelectorAll('tbody > tr');
      return [...rows].flatMap((elem) => {
        if (elem && elem instanceof JsonElement) {
          return [elem];
        }
        return [];
      });
    } else {
      return [];
    }
  }

  toValue(): JvArray {
    return jvArray(this.findElems().map((elem) => elem.toValue()));
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

  protected doSetValidationData(
    validationData: ValidationData,
    path: JsPath,
  ): void {
    this.findElems().forEach((elem, index) =>
      elem.setValidationData(validationData, path.append(index)),
    );
  }
}

import {
  JsonProperty,
  JsonValue,
  jvObject,
  JvObject,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { table, tbody, td, text, tr } from './HtmlBuilder';
import { createDom } from './createDom';

export class JsonObjectElement extends JsonElement<JvObject> {
  static TAG_NAME = 'json-object';

  private table?: HTMLTableElement;

  constructor() {
    super();
  }

  toValue(): JvObject {
    if (this.table) {
      const properties: JsonProperty[] = [];
      const rows = this.table.querySelectorAll('tbody > tr');
      rows.forEach((tr) => {
        const cells = tr.querySelectorAll('* > td');
        const cell0 = cells[0];
        const cell1 = cells[1];
        if (cell0 && cell1) {
          const name: string | null = cell0.textContent;
          if (name) {
            const propValue = cell1.firstChild;
            if (propValue && propValue instanceof JsonElement) {
              const value: JsonValue = propValue.toValue();
              const p: JsonProperty = {
                name,
                value,
              };
              properties.push(p);
            }
          }
        }
      });
      return jvObject(properties);
    } else {
      return jvObject();
    }
  }

  fromValue(value: JvObject): void {
    if (this.table) {
      this.removeChild(this.table);
    }
    const newTable = table({}, [
      tbody(
        {},
        value.properties.map((property) =>
          tr({}, [
            td({}, [text(property.name)]),
            td({}, [createDom(property.value)]),
          ]),
        ),
      ),
    ]);
    this.table = newTable;
    this.appendChild(newTable);
  }
}

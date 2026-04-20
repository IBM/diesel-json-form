import {
  JsonValue,
  JsPath,
  jvObject,
  JvObject,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { table, tbody, td, text, tr } from './HtmlBuilder';
import { createDom } from './createDom';
import { ValidationData } from './ValidationData';

export class JsonObjectElement extends JsonElement<JvObject> {
  static TAG_NAME = 'json-object';

  private table?: HTMLTableElement;

  constructor() {
    super();
  }

  private findProps(): readonly [string, JsonElement<JsonValue>][] {
    if (this.table) {
      const rows = [...this.table.querySelectorAll('tbody > tr')];
      return rows.flatMap((tr) => {
        const cells = tr.querySelectorAll('* > td');
        const cell0 = cells[0];
        const cell1 = cells[1];
        if (cell0 && cell1) {
          const name: string | null = cell0.textContent;
          if (name) {
            const propValue = cell1.firstChild;
            if (propValue && propValue instanceof JsonElement) {
              return [[name, propValue]];
            }
          }
        }
        return [];
      });
    } else {
      return [];
    }
  }

  toValue(): JvObject {
    return jvObject(
      this.findProps().map(([name, elem]) => ({ name, value: elem.toValue() })),
    );
  }

  fromValue(value: JvObject, onChange: () => void): void {
    if (this.table) {
      this.removeChild(this.table);
    }
    const newTable = table({}, [
      tbody(
        {},
        value.properties.map((property) =>
          tr({}, [
            td({}, [text(property.name)]),
            td({}, [createDom(property.value, onChange)]),
          ]),
        ),
      ),
    ]);
    this.table = newTable;
    this.appendChild(newTable);
  }

  protected doSetValidationData(validationData: ValidationData, path: JsPath) {
    this.findProps().forEach(([name, elem]) =>
      elem.setValidationData(validationData, path.append(name)),
    );
  }
}

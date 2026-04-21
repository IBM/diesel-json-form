import {
  JsonValue,
  JsPath,
  jvObject,
  JvObject,
  Metadata,
  SchemaService,
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

  private findProps(): readonly [string, JsonElement<JsonValue>][] {
    if (this.table) {
      const rows = [...this.table.querySelectorAll(':scope > tbody > tr')];
      return rows.flatMap((tr) => {
        const cells = tr.querySelectorAll(':scope > td');
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
    const props = this.findProps();
    return jvObject(
      props.map(([name, elem]) => ({ name, value: elem.toValue() })),
    );
  }

  fromValue(
    value: JvObject,
    onChange: () => void,
    schemaService: SchemaService,
  ): void {
    if (this.table) {
      this.removeChild(this.table);
    }
    const newTable = table({ border: '1px solid gray' }, [
      tbody(
        {},
        value.properties.map((property) =>
          tr({}, [
            td({}, [text(property.name)]),
            td({}, [createDom(property.value, onChange, schemaService)]),
          ]),
        ),
      ),
    ]);
    this.table = newTable;
    this.appendChild(newTable);
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath) {
    this.findProps().forEach(([name, elem]) =>
      elem.setMetadata(metadata, path.append(name)),
    );
  }
}

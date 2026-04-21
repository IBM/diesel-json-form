import {
  JsonValue,
  JsPath,
  jvArray,
  JvArray,
  Metadata,
  SchemaService,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { button, table, tbody, td, text, tr } from './HtmlBuilder';
import { createDom } from './createDom';

export class JsonArrayElement extends JsonElement<JvArray> {
  static TAG_NAME = 'json-array';

  private table?: HTMLTableElement;
  private onChange?: () => void;
  private counter: number = 0;

  constructor() {
    super();
  }

  private findRows(): Element[] {
    if (this.table) {
      return [...this.table.querySelectorAll(':scope > tbody > tr')];
    } else {
      return [];
    }
  }

  private findElems(): readonly JsonElement<JsonValue>[] {
    return this.findRows().flatMap((elem) => {
      if (elem && elem instanceof JsonElement) {
        return [elem];
      }
      return [];
    });
  }

  toValue(): JvArray {
    return jvArray(this.findElems().map((elem) => elem.toValue()));
  }

  private deleteElement(rowId: number) {
    const row = this.findRows().find(
      (e) => e.getAttribute('rowId') === rowId.toString(),
    );
    if (row) {
      row.remove();
      this.onChange?.();
    }
  }

  fromValue(
    value: JvArray,
    onChange: () => void,
    schemaService: SchemaService,
  ): void {
    this.onChange = onChange;
    if (this.table) {
      this.removeChild(this.table);
    }
    const newTable = table({ border: '1px solid gray' }, [
      tbody(
        {},
        value.elems.map((elem) => {
          const counter = this.counter;
          this.counter++;
          const btn = button({}, [text('delete elem')]);
          btn.addEventListener('click', () => {
            this.deleteElement(counter);
          });
          const row = tr({}, [
            td({}, [createDom(elem, onChange, schemaService)]),
            td({}, [btn]),
          ]);
          row.setAttribute('rowId', counter.toString());
          return row;
        }),
      ),
    ]);
    this.table = newTable;
    this.appendChild(newTable);
    const addBtn = button({}, [text('Add item')]);
    this.appendChild(addBtn);
    addBtn.addEventListener('click', () => {});
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath): void {
    this.findElems().forEach((elem, index) =>
      elem.setMetadata(metadata, path.append(index)),
    );
  }
}

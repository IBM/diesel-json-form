import {
  defaultSchemaService,
  JsonValue,
  JsPath,
  jvArray,
  JvArray,
  jvNull,
  jvString,
  Metadata,
  SchemaService,
  setValueAt,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { button, table, tbody, td, text, tr } from './HtmlBuilder';
import { createDom } from './createDom';
import { findEnclosingForm } from './findEnclosingForm';
import { maybeOf } from 'tea-cup-fp';

export class JsonArrayElement extends JsonElement<JvArray> {
  static TAG_NAME = 'json-array';

  private table?: HTMLTableElement;
  private onChange?: () => void;
  private counter: number = 0;
  private schemaService: SchemaService = defaultSchemaService;

  constructor() {
    super();
  }

  private findRows(): Element[] {
    if (this.table) {
      return Array.from(this.table.querySelectorAll(':scope > tbody > tr'));
    } else {
      return [];
    }
  }

  private findElems(): readonly JsonElement<JsonValue>[] {
    return this.findRows().flatMap((elem) => {
      const cell = elem.querySelector(':scope > td');
      if (cell?.firstChild && cell?.firstChild instanceof JsonElement) {
        return [cell.firstChild];
      }
      return [];
    });
  }

  toValue(): JvArray {
    const elems = this.findElems();
    const values = elems.map((e) => e.toValue());
    return jvArray(values);
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

  private mkRow(elem: JsonValue): Element {
    if (this.onChange) {
      const counter = this.counter;
      this.counter++;
      const btn = button({}, [text('delete elem')]);
      btn.addEventListener('click', () => {
        this.deleteElement(counter);
      });
      const row = tr({}, [
        td({}, [createDom(elem, this.onChange, this.schemaService)]),
        td({}, [btn]),
      ]);
      row.setAttribute('rowId', counter.toString());
      return row;
    } else {
      throw 'onChange not available';
    }
  }

  fromValue(
    value: JvArray,
    onChange: () => void,
    schemaService: SchemaService,
  ): void {
    this.onChange = onChange;
    this.schemaService = schemaService;
    if (this.table) {
      this.removeChild(this.table);
    }
    const newTable = table({ border: '1px solid gray' }, [
      tbody(
        {},
        value.elems.map((elem) => this.mkRow(elem)),
      ),
    ]);
    this.table = newTable;
    this.appendChild(newTable);
    const addBtn = button({}, [text('Add item')]);
    this.appendChild(addBtn);
    addBtn.addEventListener('click', () => {
      const form = findEnclosingForm(this);
      const schema = form.getSchema();
      if (schema) {
        const root = form.toValue();
        const elems = this.findElems();
        const newElemIndex = elems.length;
        // we create a transient JsonValue with the array updated
        // so that we have a value at new index path
        // otherwise the proposals would be empty because
        // no path matches the requested index
        const newArrayElems = [...this.toValue().elems, jvNull];
        const tmpArray = jvArray(newArrayElems);
        const path = form.getPath(this);
        path.forEach((p) => {
          const tmpRoot = setValueAt(root, p, tmpArray);
          schemaService
            .propose(schema, tmpRoot, p.append(newElemIndex))
            .then((proposals) => maybeOf(proposals[0]).withDefault(jvNull))
            .then((proposal) => this.appendElemToArray(proposal));
        });
      } else {
        this.appendElemToArray(jvString(''));
      }
    });
  }

  private appendElemToArray(elem: JsonValue): void {
    if (this.table) {
      const tbody = this.table.querySelector(':scope > tbody');
      if (tbody) {
        const row = this.mkRow(elem);
        tbody.appendChild(row);
      }
    }
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath): void {
    this.findElems().forEach((elem, index) =>
      elem.setMetadata(metadata, path.append(index)),
    );
  }

  getChildren(): readonly [JsPath, JsonElement<JsonValue>][] {
    return this.findElems().map((elem, elemIndex) => [
      JsPath.empty.append(elemIndex),
      elem,
    ]);
  }
}

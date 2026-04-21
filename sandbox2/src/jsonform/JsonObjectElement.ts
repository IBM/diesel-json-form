import {
  clearPropertiesIfObject,
  JsonProperty,
  JsonValue,
  JsPath,
  jvNull,
  jvObject,
  JvObject,
  Metadata,
  setValueAt,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { button, div, empty, table, tbody, td, text, tr } from './HtmlBuilder';
import { createDom } from './createDom';
import { findEnclosingForm } from './findEnclosingForm';

export class JsonObjectElement extends JsonElement<JvObject> {
  static TAG_NAME = 'json-object';

  private table: HTMLTableElement = table({ border: '1px solid gray' });
  private propertiesNode: HTMLElement = div({});

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this.table);
    this.appendChild(this.propertiesNode);
  }

  private findProps(): readonly [string, JsonElement<JsonValue>][] {
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
  }

  toValue(): JvObject {
    const props = this.findProps();
    return jvObject(
      props.map(([name, elem]) => ({ name, value: elem.toValue() })),
    );
  }

  private mkRow(property: JsonProperty): Element {
    return tr({}, [
      td({}, [text(property.name)]),
      td({}, [createDom(property.value)]),
    ]);
  }

  fromValue(value: JvObject): void {
    const newBody = tbody(
      {},
      value.properties.map((property) => this.mkRow(property)),
    );
    empty(this.table);
    this.table.appendChild(newBody);
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath) {
    this.findProps().forEach(([name, elem]) =>
      elem.setMetadata(metadata, path.append(name)),
    );
    empty(this.propertiesNode);
    const props = metadata.propertiesToAdd.get(path.format()) ?? [];
    for (const prop of props) {
      const btn = button({}, [text('+ ' + prop)]);
      btn.addEventListener('click', () => {
        btn.disabled = true;
        this.addProperty(prop);
      });
      this.propertiesNode.appendChild(btn);
    }
  }

  private addProperty(propertyName: string) {
    // create the new object with a null value
    // because we need it to propose
    const value = this.toValue();
    const newObject = jvObject([
      ...value.properties,
      { name: propertyName, value: jvNull },
    ]);
    const form = findEnclosingForm(this);
    const curRoot = form.toValue();
    const path = form.getPath(this);
    const schema = form.getSchema();
    if (path.type === 'Just' && schema) {
      const newRoot = setValueAt(curRoot, path.value, newObject);
      form
        .getSchemaService()
        .propose(schema, newRoot, path.value.append(propertyName))
        .then((proposals) => {
          const propertyProposals = proposals.map(clearPropertiesIfObject);
          const proposal = propertyProposals[0];
          if (proposal) {
            // append the prop
            const p: JsonProperty = {
              name: propertyName,
              value: proposal,
            };
            const row = this.mkRow(p);
            const tbody = this.table.querySelector(':scope > tbody');
            if (tbody) {
              tbody.append(row);
              form.onChange();
            }
          }
        })
        .catch((err) => console.error('error', err));
    }
  }

  getChildren(): readonly [JsPath, JsonElement<JsonValue>][] {
    return this.findProps().map((prop) => [
      JsPath.empty.append(prop[0]),
      prop[1],
    ]);
  }
}

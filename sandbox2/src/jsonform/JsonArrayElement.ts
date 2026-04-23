import {
  clearPropertiesIfObject,
  JsonValue,
  JsPath,
  jvArray,
  JvArray,
  jvNull,
  Metadata,
  setValueAt,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { div, empty } from './HtmlBuilder';
import { createDom } from './createDom';
import { findEnclosingForm } from './findEnclosingForm';
import { CollapsibleSection } from './CollapsibleSection';
import { createMenu } from './createMenu';
import { maybeOf } from 'tea-cup-fp';

export class JsonArrayElement extends JsonElement<JvArray> {
  static TAG_NAME = 'json-array';

  private elemsContainer: HTMLElement = div({ className: 'json-array-items' });

  constructor() {
    super();
    this.appendChild(this.elemsContainer);
  }

  private findSections(): CollapsibleSection[] {
    const rows = [];
    for (const s of this.elemsContainer.children) {
      if (s instanceof CollapsibleSection) {
        rows.push(s);
      }
    }
    return rows;
  }

  private findElems(): readonly JsonElement<JsonValue>[] {
    return this.findSections().flatMap((s) => {
      const content = s.getContent();
      return content === undefined ? [] : [content];
    });
  }

  toValue(): JvArray {
    const elems = this.findElems();
    const values = elems.map((e) => e.toValue());
    return jvArray(values);
  }

  private refreshItemNumbers() {
    this.findSections().forEach((s, i) => {
      s.setTitle('#' + i);
    });
  }

  private mkRow(elem: JsonValue): Element {
    const collapsibleSection = new CollapsibleSection();
    collapsibleSection.setContent(createDom(elem));
    collapsibleSection.setMenuItems(() => {
      const form = findEnclosingForm(this);
      const schema = form.getSchema();
      if (!schema) {
        return Promise.resolve([]);
      }
      const rowIndex = this.findSections().indexOf(collapsibleSection);
      if (rowIndex !== -1) {
        return form
          .getPath(this)
          .map((path) =>
            createMenu(
              form.getSchemaService(),
              schema,
              form.toValue(),
              path.append(rowIndex),
              false,
              {
                delete: () => {
                  this.delete(collapsibleSection);
                },
                moveUp: () => {
                  this.moveUp(collapsibleSection);
                },
                moveDown: () => {
                  this.moveDown(collapsibleSection);
                },
              },
            ),
          )
          .withDefaultSupply(() => Promise.resolve([]));
      } else {
        return Promise.resolve([]);
      }
    });
    return collapsibleSection;
  }

  private delete(section: CollapsibleSection) {
    section.remove();
    this.refreshItemNumbers();
    findEnclosingForm(this).onChange();
  }

  private moveUp(section: CollapsibleSection) {
    if (section.previousElementSibling) {
      section.parentNode?.insertBefore(section, section.previousElementSibling);
      this.refreshItemNumbers();
      findEnclosingForm(this).onChange();
    }
  }

  private moveDown(section: CollapsibleSection) {
    if (section.nextElementSibling) {
      section.parentNode?.insertBefore(section.nextElementSibling, section);
      this.refreshItemNumbers();
      findEnclosingForm(this).onChange();
    }
  }

  appendItem(): void {
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
        form
          .getSchemaService()
          .propose(schema, tmpRoot, p.append(newElemIndex))
          .then((proposals) => maybeOf(proposals[0]).withDefault(jvNull))
          .then(clearPropertiesIfObject)
          .then((proposal) => this.appendValue(proposal))
          .catch(() => {
            console.warn('broken json', tmpRoot);
            this.appendValue(jvNull);
          });
      });
    } else {
      this.appendValue(jvNull);
    }
  }

  appendValue(value: JsonValue): void {
    const newRow = this.mkRow(value);
    this.elemsContainer.appendChild(newRow);
    this.refreshItemNumbers();
    findEnclosingForm(this).onChange();
  }

  fromValue(value: JvArray): void {
    if (this.elemsContainer) {
      empty(this.elemsContainer);
    }
    value.elems.forEach((elem) =>
      this.elemsContainer.appendChild(this.mkRow(elem)),
    );
    this.refreshItemNumbers();
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

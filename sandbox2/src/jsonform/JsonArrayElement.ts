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
import { createDom } from './createDom';
import { findEnclosingForm } from './findEnclosingForm';
import { CollapsibleSection } from './CollapsibleSection';
import { createMenu } from './createMenu';
import { maybeOf } from 'tea-cup-fp';
import { SectionBasedElement } from '../SectionBasedElement';
import { JsonElement } from './JsonElement';

export class JsonArrayElement extends SectionBasedElement<JvArray> {
  static TAG_NAME = 'json-array';

  constructor() {
    super();
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

  private mkRow(elem: JsonValue): CollapsibleSection {
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
                  this.refreshItemNumbers();
                },
                moveUp: () => {
                  this.moveUp(collapsibleSection);
                  this.refreshItemNumbers();
                },
                moveDown: () => {
                  this.moveDown(collapsibleSection);
                  this.refreshItemNumbers();
                },
                changeType: (value: JsonValue) => {
                  this.changeType(collapsibleSection, value);
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
    this.appendSection(newRow);
    this.refreshItemNumbers();
    findEnclosingForm(this).onChange();
  }

  fromValue(value: JvArray): void {
    this.emptySections();
    value.elems.forEach((elem) => this.appendSection(this.mkRow(elem)));
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

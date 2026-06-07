import { RenderedElement } from './RenderedElement';
import { maybeOf } from 'tea-cup-fp';
import { JsonForm } from './JsonForm';
import {
  clearPropertiesIfObject,
  JsonValue,
  jvArray,
  JvArray,
  jvNull,
  setValueAt,
} from '../JsonValue';
import { JsPath } from '../JsPath';
import { validateAndComputeMetadata } from '../ComputeAllTask';

export abstract class ArrayElement extends RenderedElement<JvArray> {
  getType(): 'jv-array' {
    return 'jv-array';
  }
  toValue(): JvArray {
    return jvArray(this.getElements().map((e) => e.toValue()));
  }

  abstract getElements(): readonly RenderedElement<JsonValue>[];

  protected abstract appendElement(elem: RenderedElement<JsonValue>): void;

  private async appendValue(
    form: JsonForm,
    root: JsonValue,
    v: JsonValue,
    path: JsPath,
  ) {
    return validateAndComputeMetadata(
      form.getSchemaService(),
      form.getSchema(),
      root,
    ).then((metadata) => {
      const e = form.getRenderer().render({ value: v, metadata, path });
      this.appendElement(e);
      form.onChange();
    });
  }

  appendItem() {
    const form = this.parentForm;
    const schema = form.getSchema();
    const root = form.toValue();
    const p = this.path;
    const elems = this.getElements();
    const newElemIndex = elems.length;
    const existingValues = elems.map((e) => e.toValue());
    // we create a transient JsonValue with the array updated
    // so that we have a value at new index path
    // otherwise the proposals would be empty because
    // no path matches the requested index
    const newArrayElems = existingValues.concat([jvNull]);
    const tmpArray = jvArray(newArrayElems);
    const tmpRoot = setValueAt(root, p, tmpArray);
    form
      .getSchemaService()
      .propose(schema, tmpRoot, p.append(newElemIndex))
      .then((proposals) => maybeOf(proposals[0]).withDefault(jvNull))
      .then(clearPropertiesIfObject)
      .then((proposal) => {
        const finalArray = existingValues.concat([proposal]);
        const finalRoot = setValueAt(root, p, jvArray(finalArray));
        this.appendValue(form, finalRoot, proposal, p.append(newElemIndex));
      })
      .catch((err) => {
        console.error('error while adding element', err);
      });
  }
}

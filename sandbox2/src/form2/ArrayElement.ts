import {
  JsonValue,
  Metadata,
  JsPath,
  jvNull,
  jvArray,
  setValueAt,
  clearPropertiesIfObject,
  validateAndComputeMetadata,
} from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { Renderer } from './Renderer';
import { RenderedElement } from './RenderedElement';
import { JsonForm } from './JsonForm';
import { maybeOf } from 'tea-cup-fp';

export abstract class ArrayElement extends RenderedElement {
  abstract initialize(
    renderer: Renderer,
    value: readonly JsonValue[],
    metadata: Metadata,
    path: JsPath,
  ): void;

  abstract getElements(): readonly JsonElement[];

  protected abstract appendElement(elem: JsonElement): void;

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
      const e = JsonElement.newInstance(form.getRenderer(), v, metadata, path);
      this.appendElement(e);
      form.onChange();
    });
  }

  appendItem() {
    const parentElement = this.parentJsonElement;
    const form = parentElement.parentForm;
    const schema = form.getSchema();
    const root = form.toValue();
    const p = parentElement.path;
    const elems = this.getElements();
    const newElemIndex = elems.length;
    const existingValues = elems.map((e) => e.toValue());
    if (schema) {
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
          console.error('error while validating : ' + err);
        });
    } else {
      const finalArray = existingValues.concat([jvNull]);
      const finalRoot = setValueAt(root, p, jvArray(finalArray));
      this.appendValue(form, finalRoot, jvNull, p.append(newElemIndex));
    }
  }
}

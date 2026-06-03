import { JsonValue, Metadata, JsPath } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { Renderer } from './Renderer';
import { RenderedElement } from './RenderedElement';

export abstract class ArrayElement extends RenderedElement {
  abstract initialize(
    renderer: Renderer,
    value: readonly JsonValue[],
    metadata: Metadata,
    path: JsPath,
  ): void;
  abstract getElements(): readonly JsonElement[];

  abstract appendValue(elem: JsonElement): void;

  appendItem() {
    // const parentElement = this.findEnclosingJsonElement();
    // const form = parentElement.findEnclosingForm();
    // const schema = form.getSchema();
    // if (schema) {
    //   const root = form.toValue();
    //   const elems = this.getElements();
    //   const newElemIndex = elems.length;
    //   // we create a transient JsonValue with the array updated
    //   // so that we have a value at new index path
    //   // otherwise the proposals would be empty because
    //   // no path matches the requested index
    //   const newArrayElems = elems.map((e) => e.toValue()).concat([jvNull]);
    //   const tmpArray = jvArray(newArrayElems);
    //   const p = parentElement.path;
    //   const tmpRoot = setValueAt(root, p, tmpArray);
    //   form
    //     .getSchemaService()
    //     .propose(schema, tmpRoot, p.append(newElemIndex))
    //     .then((proposals) => maybeOf(proposals[0]).withDefault(jvNull))
    //     .then(clearPropertiesIfObject)
    //     .then((proposal) => this.appendValue(proposal))
    //     .catch(() => {
    //       console.warn('broken json', tmpRoot);
    //       this.appendValue(jvNull);
    //     });
    // } else {
    //   this.appendValue(jvNull);
    // }
  }
}

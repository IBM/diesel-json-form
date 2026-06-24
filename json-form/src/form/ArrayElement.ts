import { RenderedElement } from './RenderedElement.js';
import { maybeOf } from 'tea-cup-fp';
import { JsonForm } from './JsonForm.js';
import {
  clearPropertiesIfObject,
  getValueAt,
  JsonValue,
  jvArray,
  JvArray,
  jvNull,
  setValueAt,
} from '../JsonValue.js';
import { JsPath } from '../JsPath.js';
import { validateAndComputeMetadata } from '../validateAndComputeMetadata.js';
import { proposeNested } from '../proposeNested.js';

type Appender = (elem: RenderedElement<JsonValue>) => void;

type AppendItemProposal = {
  root: JsonValue;
  proposal: JsonValue;
  existingValues: readonly JsonValue[];
  newElemIndex: number;
};

export abstract class ArrayElement extends RenderedElement<JvArray> {
  getType(): 'jv-array' {
    return 'jv-array';
  }

  appendItem?(): void;

  protected getAppendItemProposal(
    clearObjectProperties: boolean,
  ): Promise<AppendItemProposal> {
    const form = this.parentForm;
    const schema = form.schema;
    const root = form.toValue();
    const p = this.path;
    // const elems = this.getElements();
    const thisValue = getValueAt(root, p);
    const existingValues = thisValue
      .map((v) => {
        if (v.tag === 'jv-array') {
          return v.elems;
        } else {
          return [];
        }
      })
      .withDefault([]);
    const newElemIndex = existingValues.length;
    // we create a transient JsonValue with the array updated
    // so that we have a value at new index path
    // otherwise the proposals would be empty because
    // no path matches the requested index
    const newArrayElems = existingValues.concat([jvNull]);
    const tmpArray = jvArray(newArrayElems);
    const tmpRoot = setValueAt(root, p, tmpArray);
    const proposals = proposeNested(
      schema,
      form.schemaService,
      tmpRoot,
      p.append(newElemIndex),
      2,
    );
    return (
      proposals
        // form
        //       .getSchemaService()
        //       .propose(schema, tmpRoot, p.append(newElemIndex))
        .then((ps) => maybeOf(ps[0]).withDefault(jvNull))
        .then((x) => (clearObjectProperties ? clearPropertiesIfObject(x) : x))
        .then((proposal) => ({
          root,
          proposal,
          existingValues,
          newElemIndex,
        }))
    );
  }

  protected doAppendItem(appender: Appender, clearObjectProperties: boolean) {
    this.getAppendItemProposal(clearObjectProperties)
      .then(({ root, proposal, existingValues, newElemIndex }) => {
        const finalArray = existingValues.concat([proposal]);
        const p = this.path;
        const finalRoot = setValueAt(root, p, jvArray(finalArray));
        const form = this.parentForm;
        this.appendValue(
          appender,
          form,
          finalRoot,
          proposal,
          p.append(newElemIndex),
        );
      })
      .catch((err) => {
        console.error('error while adding element', err);
      });
  }

  private async appendValue(
    appender: Appender,
    form: JsonForm,
    root: JsonValue,
    v: JsonValue,
    path: JsPath,
  ) {
    return validateAndComputeMetadata(
      form.schemaService,
      form.schema,
      root,
    ).then((metadata) => {
      const e = form.renderer.render({ value: v, metadata, path });
      appender(e);
      form.onChange();
    });
  }
}

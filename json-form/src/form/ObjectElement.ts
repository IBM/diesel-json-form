import { validateAndComputeMetadata } from '../validateAndComputeMetadata';
import {
  clearPropertiesIfObject,
  getValueAt,
  JsonProperty,
  JsonValue,
  jvNull,
  jvObject,
  JvObject,
  setValueAt,
} from '../JsonValue';
import { RenderedElement } from './RenderedElement';
import { maybeOf } from 'tea-cup-fp';
import { Metadata } from '../Metadata';
import { JsPath } from '../JsPath';

type Appender = (
  name: string,
  elem: RenderedElement<JsonValue>,
  metadata: Metadata,
  path: JsPath,
) => void;

export abstract class ObjectElement extends RenderedElement<JvObject> {
  getType(): 'jv-object' {
    return 'jv-object';
  }

  appendProperty?(): void;

  protected appendPropertyFromValue(
    property: JsonProperty,
    appender: Appender,
  ) {
    const form = this.parentForm;
    const schema = form.getSchema();
    const root = form.toValue();
    const p = this.path;
    const thisObj = getValueAt(root, p);
    const existingPropValues = thisObj
      .map((v) => {
        if (v.tag === 'jv-object') {
          return v.properties;
        } else {
          return [];
        }
      })
      .withDefault([]);
    const newProps = [...existingPropValues, property];
    const tmpObject = jvObject(newProps);
    const tmpRoot = setValueAt(root, p, tmpObject);
    const propPath = p.append(property.name);
    form
      .getSchemaService()
      .propose(schema, tmpRoot, propPath)
      .then((proposals) => maybeOf(proposals[0]).withDefault(property.value))
      .then(clearPropertiesIfObject)
      .then((proposal) => {
        const finalObject = jvObject([
          ...existingPropValues,
          { name: property.name, value: proposal },
        ]);
        const finalRoot = setValueAt(root, p, finalObject);
        return validateAndComputeMetadata(
          form.getSchemaService(),
          form.getSchema(),
          finalRoot,
        ).then((metadata) => {
          const e = form.getRenderer().render({
            value: proposal,
            metadata,
            path: propPath,
          });
          appender(property.name, e, metadata, propPath);
          form.onChange();
        });
      });
  }

  protected appendPropertyWithName(propertyName: string, appender: Appender) {
    // create the new object with a null value
    // because we need it to propose
    const value = this.toValue();
    const newObject = jvObject([
      ...value.properties,
      { name: propertyName, value: jvNull },
    ]);
    const form = this.parentForm;
    const curRoot = form.toValue();
    const path = this.path;
    const schema = form.getSchema();
    const newRoot = setValueAt(curRoot, path, newObject);
    const propPath = path.append(propertyName);
    form
      .getSchemaService()
      .propose(schema, newRoot, propPath)
      .then((proposals) => {
        const propertyProposals = proposals.map(clearPropertiesIfObject);
        const proposal = propertyProposals[0];
        if (proposal) {
          this.appendPropertyFromValue(
            { name: propertyName, value: proposal },
            appender,
          );
        }
      })
      .catch((err) => console.error('error', err));
  }
}

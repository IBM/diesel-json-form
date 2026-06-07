import { validateAndComputeMetadata } from '../ComputeAllTask';
import {
  clearPropertiesIfObject,
  JsonProperty,
  JsonValue,
  jvNull,
  jvObject,
  JvObject,
  setValueAt,
} from '../JsonValue';
import { RenderedElement } from './RenderedElement';
import { maybeOf } from 'tea-cup-fp';

export abstract class ObjectElement extends RenderedElement<JvObject> {
  getType(): 'jv-object' {
    return 'jv-object';
  }
  toValue(): JvObject {
    return jvObject(
      this.getProperties().map(([name, elem]) => ({
        name,
        value: elem.toValue(),
      })),
    );
  }

  abstract getProperties(): [string, RenderedElement<JsonValue>][];

  protected abstract openDialog(): Promise<JsonProperty>;

  protected abstract appendProperty(
    name: string,
    elem: RenderedElement<JsonValue>,
  ): void;

  appendPropertyWithDialog(): void {
    this.openDialog()
      .then(this.appendPropertyFromValue.bind(this))
      .catch((err) => console.error('error while adding property', err));
  }

  private appendPropertyFromValue(property: JsonProperty) {
    const form = this.parentForm;
    const schema = form.getSchema();
    const root = form.toValue();
    const p = this.path;
    const props = this.getProperties();
    const existingPropValues: JsonProperty[] = props.map(([name, elem]) => ({
      name,
      value: elem.toValue(),
    }));
    const newProps = [...existingPropValues, property];
    const tmpObject = jvObject(newProps);
    const tmpRoot = setValueAt(root, p, tmpObject);
    form
      .getSchemaService()
      .propose(schema, tmpRoot, p.append(property.name))
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
            path: p.append(property.name),
          });
          this.appendProperty(property.name, e);
          form.onChange();
        });
      });
  }

  protected appendPropertyWithName(propertyName: string) {
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
          this.appendPropertyFromValue({ name: propertyName, value: proposal });
        }
      })
      .catch((err) => console.error('error', err));
  }
}

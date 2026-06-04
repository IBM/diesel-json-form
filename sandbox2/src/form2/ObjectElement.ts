import {
  JsonProperty,
  JsonValue,
  jvObject,
  JvObject,
} from '@diesel-parser/json-form';
import { RenderedElement } from './RenderedElement';

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
    // this.openDialog()
    //   .then((newProperty) => {
    //     const parentElement = this.parentJsonElement;
    //     const form = parentElement.parentForm;
    //     const schema = form.getSchema();
    //     const root = form.toValue();
    //     const p = parentElement.path;
    //     const props = this.getProperties();
    //     const existingPropValues: JsonProperty[] = props.map(
    //       ([name, elem]) => ({
    //         name,
    //         value: elem.toValue(),
    //       }),
    //     );
    //     const newProps = [...existingPropValues, newProperty];
    //     const tmpObject = jvObject(newProps);
    //     const tmpRoot = setValueAt(root, p, tmpObject);
    //     form
    //       .getSchemaService()
    //       .propose(schema, tmpRoot, p.append(newProperty.name))
    //       .then((proposals) =>
    //         maybeOf(proposals[0]).withDefault(newProperty.value),
    //       )
    //       .then(clearPropertiesIfObject)
    //       .then((proposal) => {
    //         const finalObject = jvObject([
    //           ...existingPropValues,
    //           { name: newProperty.name, value: proposal },
    //         ]);
    //         const finalRoot = setValueAt(root, p, finalObject);
    //         return validateAndComputeMetadata(
    //           form.getSchemaService(),
    //           form.getSchema(),
    //           finalRoot,
    //         ).then((metadata) => {
    //           const e = JsonElement.newInstance(
    //             form.getRenderer(),
    //             proposal,
    //             metadata,
    //             p.append(newProperty.name),
    //           );
    //           this.appendProperty(newProperty.name, e);
    //           form.onChange();
    //         });
    //       });
    //   })
    //   .catch((err) => console.error('error while adding property', err));
  }
}

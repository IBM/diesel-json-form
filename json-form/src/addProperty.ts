import { just, nothing, Task } from 'tea-cup-fp';
import {
  clearPropertiesIfObject,
  getValueAt,
  JsonValue,
  jvNull,
  jvObject,
  setValueAt,
} from './JsonValue';
import { SchemaService } from './SchemaService';
import { JsPath } from './JsPath';

export function addPropertyTask(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
  propertyName: string,
): Task<Error, JsonValue> {
  return getValueAt(root, path)
    .andThen((value) => {
      if (value.tag === 'jv-object') {
        return just(value);
      } else {
        return nothing;
      }
    })
    .map((owner) => {
      return Task.fromPromise(async () => {
        // create the new object with a null value
        // because we need it to propose
        const newObject = jvObject([
          ...owner.properties,
          { name: propertyName, value: jvNull },
        ]);

        const newRoot = setValueAt(root, path, newObject);
        const proposals = await schemaService.propose(
          schema,
          newRoot,
          path.append(propertyName),
        );

        const propertyProposals = proposals.map(clearPropertiesIfObject);

        const newObject2 = jvObject([
          ...owner.properties,
          {
            name: propertyName,
            value:
              propertyProposals.length === 0 ? jvNull : propertyProposals[0],
          },
        ]);

        return setValueAt(root, path, newObject2);
      });
    })
    .withDefaultSupply(() =>
      Task.fail('owner not found at path ' + path.format()),
    );
}

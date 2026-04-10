import { just, maybeOf, nothing, Task } from 'tea-cup-fp';
import {
  clearPropertiesIfObject,
  getValueAt,
  JsonValue,
  JvArray,
  jvArray,
  jvNull,
  setValueAt,
} from './JsonValue';
import { JsPath } from './JsPath';
import { SchemaService } from './SchemaService';

export function addElementToArrayTask(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
): Task<Error, JsonValue> {
  return getValueAt(root, path)
    .andThen((value) => {
      if (value.tag === 'jv-array') {
        return just(value);
      } else {
        return nothing;
      }
    })
    .map((array) => {
      return Task.fromPromise(async () => {
        const newElemIndex = array.elems.length;

        // we create a transient JsonValue with the array updated
        // so that we have a value at new index path
        // otherwise the proposals would be empty because
        // no path matches the requested index
        const tmpArray = jvArray([...array.elems, jvNull]);
        const tmpRoot = setValueAt(root, path, tmpArray);
        const proposals = await schemaService.propose(
          schema,
          tmpRoot,
          path.append(newElemIndex),
        );
        const proposal = maybeOf(proposals[0]).withDefault(jvNull);
        const newArray: JvArray = {
          ...array,
          elems: [...array.elems, clearPropertiesIfObject(proposal)],
        };
        return setValueAt(root, path, newArray);
      });
    })
    .withDefaultSupply(() =>
      Task.fail('owner not found at path ' + path.format()),
    );
}

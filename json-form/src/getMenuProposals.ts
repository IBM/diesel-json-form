import { Task } from 'tea-cup-fp';
import { JsonValue } from './JsonValue';
import { JsPath } from './JsPath';
import { SchemaService } from './SchemaService';

export function getMenuProposals(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
): Task<Error, ReadonlyArray<JsonValue>> {
  return Task.fromPromise(() => schemaService.propose(schema, root, path));
}

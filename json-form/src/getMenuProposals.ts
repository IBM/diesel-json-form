import { Task } from 'tea-cup-fp';
import { JsonValue } from './JsonValue.js';
import { JsPath } from './JsPath.js';
import { SchemaService } from './SchemaService.js';

export function getMenuProposals(
  schemaService: SchemaService,
  schema: JsonValue,
  root: JsonValue,
  path: JsPath,
): Task<Error, ReadonlyArray<JsonValue>> {
  return Task.fromPromise(() => schemaService.propose(schema, root, path));
}

import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { SchemaInfos } from './SchemaInfos';

export interface RendererArgs {
  readonly value: JsonValue;
  readonly path: JsPath;
  readonly valueChanged: (path: JsPath) => void;
  readonly schemaInfos?: SchemaInfos;
}

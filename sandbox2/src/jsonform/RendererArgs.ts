import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { SchemaInfos } from './SchemaInfos';
import { Renderer } from './Renderer';

export interface RendererArgs<T extends JsonValue> {
  readonly value: T;
  readonly path: JsPath;
  readonly valueChanged: (path: JsPath) => void;
  readonly schemaInfos: SchemaInfos;
  readonly renderer: Renderer;
}

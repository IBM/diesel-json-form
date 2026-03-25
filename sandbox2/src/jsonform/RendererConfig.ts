import { JsonValue, JsPath } from '@diesel-parser/json-form';
import { SchemaInfos } from './SchemaInfos';
import { Renderer } from './Renderer';

export interface RenderConfig {
  readonly valueChanged: (path: JsPath, newValue: JsonValue) => void;
  readonly schemaInfos: SchemaInfos;
  readonly renderer: Renderer;
}

import { JsonValue } from '../JsonValue.js';
import { Model } from '../Model.js';
import { JsPath } from '../JsPath.js';
import { Dispatcher } from 'tea-cup-fp';
import { Msg } from '../Msg.js';
import { RendererFactory } from './Renderer.js';
import { RenderOptions } from '../RenderOptions.js';

export interface ViewValueProps<T extends JsonValue> {
  readonly model: Model;
  readonly path: JsPath;
  readonly value: T;
  readonly rendererFactory: RendererFactory;
  readonly dispatch: Dispatcher<Msg>;
  readonly language: string;
  readonly renderOptions?: RenderOptions;
  readonly instanceId: string;
}

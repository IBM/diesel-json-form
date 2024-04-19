import { JsonValue } from '../JsonValue';
import { Model } from '../Model';
import { JsPath } from '../JsPath';
import { Dispatcher } from 'tea-cup-core';
import { Msg } from '../Msg';
import { RendererFactory } from './Renderer';

export interface ViewValueProps<T extends JsonValue> {
  readonly model: Model;
  readonly path: JsPath;
  readonly value: T;
  readonly rendererFactory: RendererFactory;
  readonly dispatch: Dispatcher<Msg>;
  readonly language: string;
}

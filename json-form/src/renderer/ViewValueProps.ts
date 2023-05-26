import { JsonValue } from '../JsonValue';
import { BaseProps, RendererFactory } from './Renderer';
import { Model } from '../Model';
import { JsPath } from '../JsPath';
import { Dispatcher } from 'tea-cup-core';
import { Msg } from '../Msg';

export interface ViewValueProps<T extends JsonValue> extends BaseProps {
  readonly model: Model;
  readonly path: JsPath;
  readonly value: T;
  readonly rendererFactory: RendererFactory;
  readonly dispatch: Dispatcher<Msg>;
}

import { Cmd, Dispatcher, Maybe, maybeOf } from 'tea-cup-core';
import { JsonValue } from './JsonValue';
import { Model as FormModel } from './Model';
import React from 'react';
import { JsPath } from './JsPath';

export interface CustomRenderer<Model, Msg> {
  reinit(
    path: JsPath,
    formModel: FormModel,
    value: JsonValue,
    model: Maybe<Model>,
    schema: any,
  ): [Model, Cmd<Msg>];
  view(dispatch: Dispatcher<Msg>, model: Model): React.ReactElement;
  update(msg: Msg, model: Model): [Model, Cmd<Msg>, Maybe<JsonValue>];
}

export class CustomRendererFactory {
  private renderers: Map<string, CustomRenderer<any, any>> = new Map();

  addRenderer<Model, Msg>(key: string, renderer: CustomRenderer<Model, Msg>) {
    this.renderers.set(key, renderer);
  }

  getRenderer<Model, Msg>(key: string): Maybe<CustomRenderer<Model, Msg>> {
    const renderer = this.renderers.get(key);
    return maybeOf(renderer as CustomRenderer<Model, Msg>);
  }
}

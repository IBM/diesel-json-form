import { Cmd, Dispatcher, Maybe, maybeOf } from 'tea-cup-core';
import { JsonValue } from './JsonValue';
import { Model as FormModel } from './Model';
import React from 'react';
import { JsPath } from './JsPath';

export interface RendererInitArgs<Model> {
  readonly path: JsPath;
  readonly formModel: FormModel;
  readonly value: JsonValue;
  readonly model: Maybe<Model>;
  readonly schema: any;
}

export interface RendererViewArgs<Model, Msg> {
  readonly dispatch: Dispatcher<Msg>;
  readonly model: Model;
  readonly path: JsPath;
  readonly formView: (path: JsPath, value: JsonValue) => React.ReactElement;
}

export interface CustomRenderer<Model, Msg> {
  reinit(args: RendererInitArgs<Model>): [Model, Cmd<Msg>];
  view(args: RendererViewArgs<Model, Msg>): React.ReactElement;
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

import { Cmd, Dispatcher, Maybe, maybeOf } from 'tea-cup-core';
import { JsonValue } from './JsonValue';
import { Model as FormModel } from './Model';
import React from 'react';
import { JsPath } from './JsPath';

export interface CustomRenderer<Mo, Ms> {
  reinit(
    path: JsPath,
    formModel: FormModel,
    value: JsonValue,
    model: Maybe<Mo>,
    schema: any,
  ): [Mo, Cmd<Ms>];
  view(dispatch: Dispatcher<Ms>, model: Mo): React.ReactElement;
  update(msg: Ms, model: Mo): [Mo, Cmd<Ms>, Maybe<JsonValue>];
}

export class CustomRendererFactory {
  private renderers: Map<string, CustomRenderer<any, any>> = new Map();

  addRenderer<Mo, Ms>(key: string, renderer: CustomRenderer<Mo, Ms>) {
    this.renderers.set(key, renderer);
  }

  getRenderer<Mo, Ms>(key: string): Maybe<CustomRenderer<Mo, Ms>> {
    const renderer = this.renderers.get(key);
    return maybeOf(renderer as CustomRenderer<Mo, Ms>);
  }
}

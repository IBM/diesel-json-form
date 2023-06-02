import { Maybe, maybeOf } from 'tea-cup-core';
import { Renderer } from './Renderer';
import { JsonValueType } from '../JsonValue';
import { RendererObject } from './RendererObject';

export class RendererFactory {
  private renderers: Map<string, Renderer<any, any>> = new Map();

  constructor() {
    // add the builtin renderers
    this.addBuiltinRenderer('object', RendererObject);
  }

  private addBuiltinRenderer<Model, Msg>(
    valueType: JsonValueType,
    renderer: Renderer<Model, Msg>,
  ) {
    this.addRenderer(valueType, renderer);
  }

  addRenderer<Model, Msg>(key: string, renderer: Renderer<Model, Msg>) {
    this.renderers.set(key, renderer);
  }

  getRenderer<Model, Msg>(key: string): Maybe<Renderer<Model, Msg>> {
    const renderer = this.renderers.get(key);
    return maybeOf(renderer as Renderer<Model, Msg>);
  }
}

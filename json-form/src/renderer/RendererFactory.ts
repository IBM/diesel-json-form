import { Maybe, maybeOf } from 'tea-cup-core';
import { Renderer } from './Renderer';
import { JsonValueType } from '../JsonValue';
import { RendererObject } from './RendererObject';
import { RendererString } from './RendererString';
import { RendererBoolean } from './RendererBoolean';
import { RendererNull } from './RendererNull';
import { RendererNumber } from './RendererNumber';
import { RendererArray } from './RendererArray';

export class RendererFactory {
  private renderers: Map<string, Renderer<any, any>> = new Map();

  constructor() {
    // add the builtin renderers
    this.addBuiltinRenderer('object', RendererObject);
    this.addBuiltinRenderer('array', RendererArray);
    this.addBuiltinRenderer('string', RendererString);
    this.addBuiltinRenderer('number', RendererNumber);
    this.addBuiltinRenderer('boolean', RendererBoolean);
    this.addBuiltinRenderer('null', RendererNull);
  }

  private addBuiltinRenderer<Model, Msg>(
    valueType: JsonValueType,
    renderer: Renderer<Model, Msg>,
  ) {
    this.addRenderer(valueType, renderer);
  }

  addRenderer<Model, Msg>(key: string, renderer: Renderer<Model, Msg>): void {
    this.renderers.set(key, renderer);
  }

  getRenderer<Model, Msg>(key: string): Maybe<Renderer<Model, Msg>> {
    const renderer = this.renderers.get(key);
    return maybeOf(renderer as Renderer<Model, Msg>);
  }
}

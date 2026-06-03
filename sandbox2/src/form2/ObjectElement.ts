import { JsonProperty, JsPath, Metadata } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { Renderer } from './Renderer';
import { RenderedElement } from './RenderedElement';

export abstract class ObjectElement extends RenderedElement {
  abstract initialize(
    renderer: Renderer,
    properties: readonly JsonProperty[],
    metadata: Metadata,
    path: JsPath,
  ): void;
  abstract getProperties(): [string, JsonElement][];

  appendProperty() {
    throw new Error('Method not implemented.');
  }
}

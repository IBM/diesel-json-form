import { Metadata, JsPath } from '@diesel-parser/json-form';
import { Renderer } from './Renderer';
import { JsonElement } from './JsonElement';
import { findParent } from './findParent';
import { just, nothing } from 'tea-cup-fp';

export abstract class RenderedElement extends HTMLElement {
  abstract setMetadata(
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void;

  get parentJsonElement(): JsonElement {
    return findParent(this, (e) =>
      e instanceof JsonElement ? just(e) : nothing,
    );
  }
}

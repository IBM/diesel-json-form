import { Metadata, JsPath } from '@diesel-parser/json-form';
import { Renderer } from './Renderer';

export abstract class RenderedElement extends HTMLElement {
  abstract setMetadata(
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void;
}

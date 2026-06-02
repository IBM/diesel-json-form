import { Metadata, JsPath } from '@diesel-parser/json-form';
import { Renderer } from './Renderer';
import { findEnclosingForm } from './findEnclosingForm';

export abstract class RenderedElement extends HTMLElement {
  abstract setMetadata(
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void;

  onChange(): void {
    findEnclosingForm(this).onChange();
  }
}

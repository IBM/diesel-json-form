import { Renderer, RendererKey } from './Renderer';
import { findEnclosingForm } from './findParent';
import { JsonForm } from './JsonForm';
import { JsonValue } from '../JsonValue';
import { Metadata } from '../Metadata';
import { JsPath } from '../JsPath';

export abstract class RenderedElement<T extends JsonValue> extends HTMLElement {
  rendererKey?: RendererKey;

  abstract initialize(
    value: T,
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void;

  abstract setMetadata(
    metadata: Metadata,
    path: JsPath,
    renderer: Renderer,
  ): void;

  abstract getType(): T['tag'];

  abstract toValue(): T;

  get parentForm(): JsonForm {
    return findEnclosingForm(this);
  }

  set path(p: JsPath) {
    this.setAttribute('json-form-path', p.format());
  }

  get path(): JsPath {
    const pathStr = this.getAttribute('json-form-path');
    if (pathStr === null) {
      throw new Error('path attribute not found');
    }
    return JsPath.parse(pathStr);
  }
}

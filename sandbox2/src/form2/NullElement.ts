import { JsPath, Metadata } from '@diesel-parser/json-form';
import { RenderedElement } from './RenderedElement';

export abstract class NullElement extends RenderedElement {
  abstract initialize(metadata: Metadata, path: JsPath): void;
}

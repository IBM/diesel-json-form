import { JsPath, Metadata } from '@diesel-parser/json-form';
import { RenderedElement } from './RenderedElement';

export abstract class BooleanElement extends RenderedElement {
  abstract initialize(value: boolean, metadata: Metadata, path: JsPath): void;
  abstract getBooleanValue(): boolean;
}

import { Metadata, JsPath } from '@diesel-parser/json-form';

export abstract class RenderedElement extends HTMLElement {
  abstract setMetadata(metadata: Metadata, path: JsPath): void;
}

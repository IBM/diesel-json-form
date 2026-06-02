import { Metadata, JsPath } from '@diesel-parser/json-form';
import { RenderedElement } from './RenderedElement';

export abstract class StringElement extends RenderedElement {
  abstract initialize(
    value: string,
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void;

  abstract getStrValue(): string;
}

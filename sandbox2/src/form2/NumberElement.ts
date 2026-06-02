import { JsPath, Metadata } from '@diesel-parser/json-form';
import { RenderedElement } from './RenderedElement';

export abstract class NumberElement extends RenderedElement {
  abstract initialize(
    value: string,
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void;
  abstract getNumValue(): string;
}

import { JsonValue, Metadata, JsPath } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { RenderedElement } from './RenderedElement';
import { Renderer } from './Renderer';

export abstract class ArrayElement extends RenderedElement {
  abstract initialize(
    renderer: Renderer,
    value: readonly JsonValue[],
    metadata: Metadata,
    path: JsPath,
    onChange: () => void,
  ): void;
  abstract getElements(): readonly JsonElement[];
}

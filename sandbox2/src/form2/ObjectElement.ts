import { JsonElement } from './JsonElement';
import { RenderedElement } from './RenderedElement';

export abstract class ObjectElement extends RenderedElement {
  abstract getProperties(): [string, JsonElement][];
}

import { JsonValue } from '../JsonValue.js';
import { ArrayElement } from './ArrayElement.js';
import { ObjectElement } from './ObjectElement.js';
import { RenderedElement } from './RenderedElement.js';

export function getAddFunction(
  e?: RenderedElement<JsonValue>,
): (() => void) | undefined {
  if (e instanceof ArrayElement && e.appendItem) {
    return e.appendItem.bind(e);
  } else if (e instanceof ObjectElement && e.appendProperty) {
    return e.appendProperty.bind(e);
  }
}

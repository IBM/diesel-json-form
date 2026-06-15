import { JsonValue } from '../JsonValue';
import { ArrayElement } from './ArrayElement';
import { ObjectElement } from './ObjectElement';
import { RenderedElement } from './RenderedElement';

export function getAddFunction(
  e?: RenderedElement<JsonValue>,
): (() => void) | undefined {
  if (e instanceof ArrayElement && e.appendItem) {
    return e.appendItem.bind(e);
  } else if (e instanceof ObjectElement && e.appendProperty) {
    return e.appendProperty.bind(e);
  }
}

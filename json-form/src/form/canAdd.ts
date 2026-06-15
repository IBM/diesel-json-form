import { JsonValue } from '../JsonValue';
import { ArrayElement } from './ArrayElement';
import { ObjectElement } from './ObjectElement';
import { RenderedElement } from './RenderedElement';

export function canAdd(e?: RenderedElement<JsonValue>): boolean {
  if (e instanceof ArrayElement && e.appendItem) {
    return true;
  } else if (e instanceof ObjectElement) {
    return true;
  }
  return false;
}

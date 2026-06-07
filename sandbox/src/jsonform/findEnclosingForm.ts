import { JsonValue } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { JsonForm } from './JsonForm';
import { JsonRootElement } from './JsonRootElement';

export function findEnclosingForm(
  element: JsonElement<JsonValue> | JsonRootElement,
): JsonForm {
  let parent = element.parentElement;
  while (parent) {
    if (parent instanceof JsonForm) {
      return parent;
    }
    parent = parent.parentElement;
  }
  throw 'No enclosing form for node ' + element;
}

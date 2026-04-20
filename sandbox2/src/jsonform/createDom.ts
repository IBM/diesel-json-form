import { JsonValue } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { JsonStringElement } from './JsonStringElement';
import { JsonNullElement } from './JsonNullElement';
import { JsonBooleanElement } from './JsonBooleanElement';
import { JsonNumberElement } from './JsonNumberElement';
import { JsonObjectElement } from './JsonObjectElement';
import { JsonArrayElement } from './JsonArrayElement';

export function createDom(
  value: JsonValue,
  onChange: () => void,
): JsonElement<JsonValue> {
  const mkNodes: () => JsonElement<JsonValue> = () => {
    switch (value.tag) {
      case 'jv-null':
        return new JsonNullElement();
      case 'jv-string':
        return new JsonStringElement();
      case 'jv-boolean':
        return new JsonBooleanElement();
      case 'jv-number':
        return new JsonNumberElement();
      case 'jv-array':
        return new JsonArrayElement();
      case 'jv-object':
        return new JsonObjectElement();
    }
  };
  const root = mkNodes();
  root.fromValue(value, onChange);
  return root;
}

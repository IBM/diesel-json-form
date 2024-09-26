import { JsonValue } from '@diesel-parser/json-form';
import { RendererArgs } from './RendererArgs';
import { JsonStringElement } from './elements/JsonStringElement';
import { JsonNumberElement } from './elements/JsonNumberElement';
import { JsonBooleanElement } from './elements/JsonBooleanElement';
import { JsonObjectElement } from './elements/JsonObjectElement';
import { JsonArrayElement } from './elements/JsonArrayElement';
import { JsonNullElement } from './elements/JsonNullElement';

export interface JsonValueElement<T extends JsonValue> {
  getValue(): T;
}

export function renderValue(
  args: RendererArgs,
): JsonValueElement<JsonValue> & HTMLElement {
  const { value } = args;
  switch (value.tag) {
    case 'jv-string': {
      return JsonStringElement.newInstance(args, value);
    }
    case 'jv-number': {
      return JsonNumberElement.newInstance(args, value);
    }
    case 'jv-boolean': {
      return JsonBooleanElement.newInstance(args, value);
    }
    case 'jv-object': {
      return JsonObjectElement.newInstance(args, value);
    }
    case 'jv-array': {
      return JsonArrayElement.newInstance(args, value);
    }
    case 'jv-null': {
      return JsonNullElement.newInstance(args);
    }
  }
}

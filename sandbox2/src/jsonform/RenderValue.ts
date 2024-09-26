import { JsonValue, jvNull } from '@diesel-parser/json-form';
import { JsonArrayElement } from './elements/JsonArrayElement';
import { JsonBooleanElement } from './elements/JsonBooleanElement';
import { JsonNullElement } from './elements/JsonNullElement';
import { JsonNumberElement } from './elements/JsonNumberElement';
import { JsonObjectElement } from './elements/JsonObjectElement';
import { JsonStringElement } from './elements/JsonStringElement';
import { JsonValueElement } from './JsonValueElement';
import { RendererArgs } from './RendererArgs';

export function renderValue(
  args: RendererArgs,
): JsonValueElement<JsonValue> & HTMLElement {
  const { value } = args;
  switch (value.tag) {
    case 'jv-string': {
      const e = JsonStringElement.newInstance();
      e.render(args, value);
      return e;
    }
    case 'jv-number': {
      const e = JsonNumberElement.newInstance();
      e.render(args, value);
      return e;
    }
    case 'jv-boolean': {
      const e = JsonBooleanElement.newInstance();
      e.render(args, value);
      return e;
    }
    case 'jv-object': {
      const e = JsonObjectElement.newInstance();
      e.render(args, value);
      return e;
    }
    case 'jv-array': {
      const e = JsonArrayElement.newInstance();
      e.render(args, value);
      return e;
    }
    case 'jv-null': {
      const e = JsonNullElement.newInstance();
      e.render(args, jvNull);
      return e;
    }
  }
}

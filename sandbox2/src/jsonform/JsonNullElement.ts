import { JvNull, jvNull } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';

export class JsonNullElement extends JsonElement<JvNull> {
  static TAG_NAME = 'json-null';

  constructor() {
    super();
  }

  toValue(): JvNull {
    return jvNull;
  }

  fromValue() {
    // no-op
  }
}

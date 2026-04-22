import { JvNull, jvNull } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { div, text } from './HtmlBuilder';

export class JsonNullElement extends JsonElement<JvNull> {
  static TAG_NAME = 'json-null';

  constructor() {
    super();
    this.appendChild(div({}, [text('null')]));
  }

  toValue(): JvNull {
    return jvNull;
  }

  fromValue() {
    // no-op
  }
}

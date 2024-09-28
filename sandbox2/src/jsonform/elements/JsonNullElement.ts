import { JvNull, jvNull } from '@diesel-parser/json-form';
import { JsonValueElementBase } from '../JsonValueElement';

export class JsonNullElement extends JsonValueElementBase<JvNull> {
  static TAG_NAME = 'json-null';

  static newInstance(): JsonNullElement {
    const e = document.createElement(
      JsonNullElement.TAG_NAME,
    ) as JsonNullElement;
    return e;
  }

  constructor() {
    super();
  }

  protected doRender() {
    this.textContent = 'null';
  }

  getValue(): JvNull {
    return jvNull;
  }
}

import { JsonValue, jvNull, SchemaService } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { createDom } from './createDom';

export class JsonForm extends HTMLElement {
  static TAG_NAME = 'json-form';

  private root?: JsonElement<JsonValue>;

  constructor() {
    super();
  }

  toValue(): JsonValue {
    if (this.root) {
      return this.root.toValue();
    }
    return jvNull;
  }

  init(schemaService: SchemaService, schema: JsonValue, value: JsonValue) {
    if (this.root) {
      this.removeChild(this.root);
    }
    const newRoot = createDom(value);
    this.root = newRoot;
    this.appendChild(newRoot);
  }
}

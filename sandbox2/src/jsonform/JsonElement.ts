import { JsonValue } from '@diesel-parser/json-form';

export abstract class JsonElement<T extends JsonValue> extends HTMLElement {
  constructor() {
    super();
  }

  abstract toValue(): T;

  abstract fromValue(value: T): void;
}

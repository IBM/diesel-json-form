import { JvArray } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';

export class JsonArrayElement extends JsonElement<JvArray> {
  static TAG_NAME = 'json-array';

  constructor() {
    super();
  }

  toValue(): JvArray {
    throw new Error('Method not implemented.');
  }

  fromValue(value: JvArray): void {
    throw new Error('Method not implemented.');
  }
}

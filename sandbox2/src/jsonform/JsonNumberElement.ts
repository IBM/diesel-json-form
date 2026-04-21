import {
  isValidNumberLiteral,
  JsPath,
  JvNumber,
  jvNumber,
  Metadata,
  ValidationError,
} from '@diesel-parser/json-form';
import { input } from './HtmlBuilder';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';

export class JsonNumberElement extends JsonElement<JvNumber> {
  static TAG_NAME = 'json-number';

  private input: HTMLInputElement;

  constructor() {
    super();
    this.input = input({
      type: 'text',
    });
  }

  toValue(): JvNumber {
    return jvNumber(this.input.value);
  }

  fromValue(value: JvNumber) {
    this.input.value = value.value;
    this.input.addEventListener('input', () => {
      findEnclosingForm(this).onChange();
    });
  }

  protected getErrors(
    metadata: Metadata,
    path: JsPath,
  ): readonly ValidationError[] {
    if (isValidNumberLiteral(this.input.value)) {
      return metadata.errors.get(path.format()) ?? [];
    } else {
      return [{ path: path.format(), message: 'Invalid number' }];
    }
  }

  connectedCallback() {
    this.appendChild(this.input);
  }
}

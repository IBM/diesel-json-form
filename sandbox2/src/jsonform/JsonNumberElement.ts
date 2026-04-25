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
import { CDSTextInput } from '@carbon/web-components';

export class JsonNumberElement extends JsonElement<JvNumber> {
  static TAG_NAME = 'json-number';

  private input: CDSTextInput;

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
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

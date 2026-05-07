import { JsPath, JvBoolean, Metadata, jvBool } from '@diesel-parser/json-form';
import { JsonElement } from './JsonElement';
import { findEnclosingForm } from './findEnclosingForm';
import { CDSCheckbox } from '@carbon/web-components';
import '@carbon/web-components/es/components/checkbox/checkbox';
import { setErrors } from './setErrorsOnInput';

export class JsonBooleanElement extends JsonElement<JvBoolean> {
  static TAG_NAME = 'json-boolean';

  private input: CDSCheckbox;

  constructor() {
    super();
    this.input = document.createElement('cds-checkbox') as CDSCheckbox;
  }

  toValue(): JvBoolean {
    return jvBool(this.input.checked);
  }

  fromValue(value: JvBoolean) {
    this.input.checked = value.value;
    this.input.addEventListener('input', () => {
      findEnclosingForm(this).onChange();
    });
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  protected doSetMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }
}

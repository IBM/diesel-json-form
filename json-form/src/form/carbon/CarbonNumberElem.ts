import { CDSTextInput } from '@carbon/web-components';
import '@carbon/web-components/es/components/text-input/index';
import { NumberElement } from '../NumberElement';
import { Debouncer } from '../Debouncer';
import { setErrors } from './setErrorsOnInput';
import { JsonForm } from '../JsonForm';
import { nextElementId } from './nextElementId';
import { T_FUNCTION } from '../../JsonFormMessages';
import { isValidNumberLiteral, JvNumber } from '../../JsonValue';
import { Metadata } from '../../Metadata';
import { JsPath } from '../../JsPath';
import { setRendererAttributes } from './setRendererAttributes';
import { SchemaRenderer } from '../../SchemaService';

export class CarbonNumberElement extends NumberElement {
  static TAG_NAME = 'json-number';

  private input: CDSTextInput;
  private readonly debouncer = new Debouncer();

  static newInstance(schemaRenderer: SchemaRenderer): CarbonNumberElement {
    const e = document.createElement(
      CarbonNumberElement.TAG_NAME,
    ) as CarbonNumberElement;
    setRendererAttributes(schemaRenderer, e.input);
    return e;
  }

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.input.id = nextElementId();
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  disconnectedCallback() {
    this.input.remove();
  }

  initialize(value: JvNumber, metadata: Metadata, path: JsPath): void {
    this.input.value = value.value;
    this.input.addEventListener('input', () => {
      if (!isValidNumberLiteral(this.input.value)) {
        if (this.path) {
          setErrors(
            [
              {
                path: this.path.format(),
                message: T_FUNCTION('invalid.number'),
              },
            ],
            true,
            this.input,
          );
        }
      }
      this.debouncer.debounce(() => {
        JsonForm.getEnclosingForm(this).onChange();
      });
    });
    this.setMetadata(metadata, path);
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }

  getNumValue(): string {
    return this.input.value;
  }
}

customElements.define(CarbonNumberElement.TAG_NAME, CarbonNumberElement);

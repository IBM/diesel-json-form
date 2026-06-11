import '@carbon/web-components/es/components/text-input/index';
import { CDSTextInput } from '@carbon/web-components';
import { setErrors } from './setErrorsOnInput';
import { NullElement } from '../NullElement';
import { JvNull } from '../../JsonValue';
import { Metadata } from '../../Metadata';
import { JsPath } from '../../JsPath';
import { setRendererAttributes } from './setRendererAttributes';
import { SchemaRenderer } from '../../SchemaService';

export class CarbonNullElement extends NullElement {
  static TAG_NAME = 'json-null';

  private input: CDSTextInput;

  static newInstance(schemaRenderer: SchemaRenderer): CarbonNullElement {
    const e = document.createElement(
      CarbonNullElement.TAG_NAME,
    ) as CarbonNullElement;
    setRendererAttributes(schemaRenderer, e.input);
    return e;
  }

  constructor() {
    super();
    this.input = document.createElement('cds-text-input') as CDSTextInput;
    this.input.value = 'null';
    this.input.disabled = true;
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  disconnectedCallback() {
    this.input.remove();
  }

  initialize(value: JvNull, metadata: Metadata, path: JsPath): void {
    this.setMetadata(metadata, path);
  }
  //   initialize(metadata: Metadata, path: JsPath): void {
  //   }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const p = path.format();
    const errors = metadata.errors.get(p);
    setErrors(errors, true, this.input);
  }
}

customElements.define(CarbonNullElement.TAG_NAME, CarbonNullElement);

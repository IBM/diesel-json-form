import { JsPath, Metadata } from '@diesel-parser/json-form';
import { StringElement } from '../StringElement';
import { MyDatePicker } from './MyDatePicker';
import { JsonForm } from '../JsonForm';

export class CarbonStringElemDate extends StringElement {
  static TAG_NAME = 'string-elem-date';

  private myPicker: MyDatePicker;
  private stringValue = '';

  constructor() {
    super();
    this.myPicker = new MyDatePicker();
  }

  connectedCallback() {
    this.appendChild(this.myPicker);
  }

  disconnectedCallback() {
    this.myPicker.remove();
  }

  initialize(value: string, metadata: Metadata, path: JsPath): void {
    this.myPicker.setValue(value);
    this.myPicker.setOnChange((value) => {
      this.stringValue = value;
      JsonForm.getEnclosingForm(this).onChange();
    });
    this.setMetadata(metadata, path);
  }

  getStrValue(): string {
    return this.stringValue;
  }

  setMetadata(metadata: Metadata, path: JsPath): void {
    const errors = metadata.errors.get(path.format());
    this.myPicker.showErrors(true, errors);
  }
}

customElements.define(CarbonStringElemDate.TAG_NAME, CarbonStringElemDate);
